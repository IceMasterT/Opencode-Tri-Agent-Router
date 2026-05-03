#!/usr/bin/env bash
set -euo pipefail

REPO="${TRI_AGENT_ROUTER_REPO:-IceMasterT/Opencode-Tri-Agent-Router}"
RAW_BASE="${TRI_AGENT_ROUTER_RAW_BASE:-https://raw.githubusercontent.com/${REPO}/main}"
INSTALL_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/opencode/plugin"
MANIFEST_NAME="tri-agent-router.manifest.json"

usage() {
  printf '%s\n' "Usage: install.sh [install|update|check] [--dir PATH]"
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    printf 'Missing required command: %s\n' "$1" >&2
    exit 1
  }
}

ACTION="install"
while [ "$#" -gt 0 ]; do
  case "$1" in
    install|update|check)
      ACTION="$1"
      ;;
    --dir)
      shift
      INSTALL_DIR="$1"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf 'Unknown argument: %s\n' "$1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

need_cmd curl
need_cmd mktemp
need_cmd python3

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

REMOTE_MANIFEST="$TMP_DIR/manifest.json"
curl -fsSL "${RAW_BASE}/manifest.json" -o "$REMOTE_MANIFEST"

remote_version="$(python3 - <<'PY' "$REMOTE_MANIFEST"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
print(data['version'])
PY
)"

local_manifest="${INSTALL_DIR}/${MANIFEST_NAME}"
local_version=""
if [ -f "$local_manifest" ]; then
  local_version="$(python3 - <<'PY' "$local_manifest"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
print(data.get('version', ''))
PY
)"
fi

if [ "$ACTION" = "check" ]; then
  if [ "$local_version" = "$remote_version" ] && [ -n "$local_version" ]; then
    printf 'Tri-Agent Router is up to date (%s).\n' "$local_version"
  elif [ -z "$local_version" ]; then
    printf 'Tri-Agent Router is not installed. Latest available version: %s\n' "$remote_version"
  else
    printf 'Update available: installed %s, latest %s\n' "$local_version" "$remote_version"
  fi
  exit 0
fi

if [ "$ACTION" = "update" ] && [ "$local_version" = "$remote_version" ] && [ -n "$local_version" ]; then
  printf 'Tri-Agent Router is already up to date (%s).\n' "$local_version"
  exit 0
fi

mkdir -p "$INSTALL_DIR"

python3 - <<'PY' "$REMOTE_MANIFEST" "$RAW_BASE" "$INSTALL_DIR"
import json
import pathlib
import sys
import urllib.request

manifest_path = pathlib.Path(sys.argv[1])
raw_base = sys.argv[2]
install_dir = pathlib.Path(sys.argv[3])

manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
for relative in manifest['files']:
    target = install_dir / pathlib.Path(relative).name
    with urllib.request.urlopen(f"{raw_base}/{relative}") as response:
        target.write_bytes(response.read())

(install_dir / 'tri-agent-router.manifest.json').write_text(
    json.dumps(manifest, indent=2) + '\n',
    encoding='utf-8',
)
PY

printf 'Tri-Agent Router %s installed to %s\n' "$remote_version" "$INSTALL_DIR"
