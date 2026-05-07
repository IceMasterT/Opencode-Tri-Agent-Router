param(
  [ValidateSet("install", "update", "check", "uninstall")]
  [string]$Action = "install",
  [string]$InstallDir = "$HOME/.config/opencode/plugin",
  [string]$RawBase = "https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main",
  [switch]$Global
)

$ErrorActionPreference = "Stop"

$ManifestName = "tri-agent-router.manifest.json"
$GlobalDir = "$HOME/.opencode/plugin"
$ManifestUrl = "$RawBase/manifest.json"

function Ensure-Dir([string]$Path) {
  New-Item -ItemType Directory -Force -Path $Path | Out-Null
}

function Remove-Install([string]$Dir) {
  if (Test-Path $Dir) {
    Remove-Item -Path (Join-Path $Dir "tri-agent-router.ts") -Force -ErrorAction SilentlyContinue
    Remove-Item -Path (Join-Path $Dir $ManifestName) -Force -ErrorAction SilentlyContinue
    Remove-Item -Path (Join-Path $Dir "agent-trondo") -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path (Join-Path $Dir "skills") -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "$HOME/.config/opencode/agent/core/agenttrondo.md" -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "$HOME/.config/opencode/.opencode/agents/agent-trondo.md" -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "$HOME/.opencode/agent/core/agenttrondo.md" -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "$HOME/.opencode/.opencode/agents/agent-trondo.md" -Force -ErrorAction SilentlyContinue
    Write-Host "Tri-Agent Router uninstalled from $Dir"
  }
}

if ($Action -eq "uninstall") {
  Remove-Install $InstallDir
  if ($Global.IsPresent) {
    Remove-Install $GlobalDir
  }
  exit 0
}

$TempManifest = Join-Path ([System.IO.Path]::GetTempPath()) "tri-agent-router-manifest.json"
Invoke-WebRequest -UseBasicParsing -Uri $ManifestUrl -OutFile $TempManifest

$RemoteManifest = Get-Content $TempManifest -Raw | ConvertFrom-Json
$RemoteVersion = $RemoteManifest.version

$LocalManifestPath = Join-Path $InstallDir $ManifestName
$LocalVersion = $null
if (Test-Path $LocalManifestPath) {
  $LocalVersion = (Get-Content $LocalManifestPath -Raw | ConvertFrom-Json).version
}

if ($Action -eq "check") {
  if ($LocalVersion -and $LocalVersion -eq $RemoteVersion) {
    Write-Host "Tri-Agent Router is up to date ($LocalVersion)."
  } elseif (-not $LocalVersion) {
    Write-Host "Tri-Agent Router is not installed. Latest available version: $RemoteVersion"
  } else {
    Write-Host "Update available: installed $LocalVersion, latest $RemoteVersion"
  }
  exit 0
}

if ($Action -eq "update" -and $LocalVersion -and $LocalVersion -eq $RemoteVersion) {
  Write-Host "Tri-Agent Router is already up to date ($LocalVersion)."
  exit 0
}

Ensure-Dir $InstallDir
if ($Global.IsPresent) {
  Ensure-Dir $GlobalDir
}

foreach ($File in $RemoteManifest.files) {
  $Target = Join-Path $InstallDir $File
  $TargetDir = Split-Path -Parent $Target
  Ensure-Dir $TargetDir
  Invoke-WebRequest -UseBasicParsing -Uri "$RawBase/$File" -OutFile $Target

  if ($Global.IsPresent) {
    $GlobalTarget = Join-Path $GlobalDir $File
    $GlobalTargetDir = Split-Path -Parent $GlobalTarget
    Ensure-Dir $GlobalTargetDir
    Copy-Item -Path $Target -Destination $GlobalTarget -Force
  }
}

# Install AgentTrondo into agent picker locations
$PrimaryAgentTarget = "$HOME/.config/opencode/agent/core/agenttrondo.md"
$SubagentTarget = "$HOME/.config/opencode/.opencode/agents/agent-trondo.md"
Ensure-Dir (Split-Path -Parent $PrimaryAgentTarget)
Ensure-Dir (Split-Path -Parent $SubagentTarget)
Copy-Item -Path (Join-Path $InstallDir "agent-trondo/AgentTrondo-Orchestration.md") -Destination $PrimaryAgentTarget -Force
Copy-Item -Path (Join-Path $InstallDir "agent-trondo/AgentTrondo.md") -Destination $SubagentTarget -Force

if ($Global.IsPresent) {
  $GlobalPrimaryAgentTarget = "$HOME/.opencode/agent/core/agenttrondo.md"
  $GlobalSubagentTarget = "$HOME/.opencode/.opencode/agents/agent-trondo.md"
  Ensure-Dir (Split-Path -Parent $GlobalPrimaryAgentTarget)
  Ensure-Dir (Split-Path -Parent $GlobalSubagentTarget)
  Copy-Item -Path (Join-Path $GlobalDir "agent-trondo/AgentTrondo-Orchestration.md") -Destination $GlobalPrimaryAgentTarget -Force
  Copy-Item -Path (Join-Path $GlobalDir "agent-trondo/AgentTrondo.md") -Destination $GlobalSubagentTarget -Force
}

$RemoteManifest | ConvertTo-Json -Depth 12 | Set-Content -Encoding UTF8 $LocalManifestPath

if ($Global.IsPresent) {
  $GlobalManifestPath = Join-Path $GlobalDir $ManifestName
  $RemoteManifest | ConvertTo-Json -Depth 12 | Set-Content -Encoding UTF8 $GlobalManifestPath
}

Write-Host "Tri-Agent Router $RemoteVersion installed to $InstallDir"
if ($Global.IsPresent) {
  Write-Host "Tri-Agent Router $RemoteVersion also installed globally to $GlobalDir"
}
