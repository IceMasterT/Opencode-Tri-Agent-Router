# Opencode Tri-Agent Router

Tri-Agent Router turns OpenCode into an orchestrated multi-agent workflow. For each request it selects:

- 1 primary agent to own the job
- 1 secondary agent to add domain depth and catch blind spots
- 1 tertiary agent to verify quality, risk, tests, or completeness

It can also auto-attach matching skills, ask for approval before execution, and now nudges the assistant to render approval as a selectable menu instead of making you type the choice by hand.

It works especially well with:

- [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent)
- [agency-agents](https://github.com/IceMasterT/agency-agents)

For additional skill packs, it pairs nicely with either:

- [opencode-agent-skills](https://github.com/joshuadavidthomas/opencode-agent-skills)
- [openskills](https://github.com/numman-ali/openskills)

If you like running OpenCode with a strong orchestrator model, this plugin fits that pattern well: **Trondo** acts as the orchestrator/reasoner, and the routed agents behave like skilled workers that cooperate on the same job until it is done.

Trondo is the reasoning orchestrator that the tri-agent-router is designed to work with. When global autonomous approval is granted, Trondo selects agents and skills automatically across all sessions.

## What It Does

- Selects exactly three agents per request
- Keeps agent roles distinct: primary, secondary, verifier
- Scans installed skills and adds the relevant ones automatically
- Supports approval modes including session approval and global autonomous approval
- Prompts the assistant to show approval choices as a selectable menu
- Supports simple GitHub-based install and update workflows

## Repository Contents

- `tri-agent-router.ts`: the plugin
- `manifest.json`: version metadata used by the installer/updater
- `install.sh`: install, update, and version check for Linux and iOS-style shells
- `install.ps1`: install, update, and version check for Windows PowerShell

## Installation

The plugin installs into:

`~/.config/opencode/plugin/tri-agent-router.ts`

The updater also writes:

`~/.config/opencode/plugin/tri-agent-router.manifest.json`

**Global install:** The plugin is also copied to `~/.opencode/plugin/` for OpenCode global plugin loading.

### Linux

Requirements:

- `bash`
- `curl`
- `python3`

Install the latest version locally:
```bash
curl -fsSL https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.sh | bash -s -- install
```

Install to a global custom plugin directory:
```bash
curl -fsSL https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.sh | bash -s -- install --dir "$HOME/.config/opencode/plugin"
```

After install, the plugin is available both in your project's `.opencode/plugin/` and globally in `~/.opencode/plugin/`.

Advanced: you can point the installer at a fork or a local test mirror with `TRI_AGENT_ROUTER_RAW_BASE`.


### Windows

Requirements:

- PowerShell 5.1+ or PowerShell 7+

Install the latest version locally:
```powershell
irm https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.ps1 | iex
```

Install to a global custom directory:
```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.ps1))) -Action install -InstallDir "$HOME/.config/opencode/plugin"
```

After install, the plugin is available both in your project's `.opencode/plugin/` and globally in `~/.opencode/plugin/`.

Install to a custom directory:

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.ps1))) -Action install -InstallDir "$HOME/.config/opencode/plugin"
```

Advanced: pass `-RawBase` if you want to install from a fork, branch mirror, or local test endpoint.

### iOS

OpenCode itself is usually reached on iOS through a remote machine, a Linux shell app, or a terminal environment such as iSH or a-Shell. If you have a shell with `bash`, `curl`, and `python3`, use the same installer as Linux.

Install locally:
```bash
curl -fsSL https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.sh | bash -s -- install
```

If your iOS shell uses a different config root, pass `--dir` explicitly.

After install, the plugin is available both in your project's `.opencode/plugin/` and globally in `~/.opencode/plugin/`.

## OpenCode Configuration

Place the plugin in your OpenCode plugin directory and make sure your OpenCode config loads it.

Example plugin reference pattern:

```ts
import TriAgentRouter from "./plugin/tri-agent-router"
```

If your setup loads plugins by path, point it at:

`~/.config/opencode/plugin/tri-agent-router.ts`

## Recommended Companion Repositories

### Agents

Clone agent packs into locations the router already scans, such as:

- `~/.config/opencode/agent`
- `~/.config/opencode/.opencode/agents`
- `<project>/.opencode/agent`
- `<project>/.opencode/agents`

Examples:

```bash
git clone https://github.com/code-yeongyu/oh-my-openagent.git "$HOME/oh-my-openagent"
git clone https://github.com/IceMasterT/agency-agents.git "$HOME/agency-agents"
```

Then copy or symlink the agent markdown files into one of the scanned agent directories.

### Skills

Clone one or both skill packs:

```bash
git clone https://github.com/joshuadavidthomas/opencode-agent-skills.git "$HOME/opencode-agent-skills"
git clone https://github.com/numman-ali/openskills.git "$HOME/openskills"
```

The router already scans these common skill locations:

- `~/.config/opencode/skills`
- `~/.agents/skills`
- `~/open-skills/skills`
- `<project>/.opencode/skills`

Copy or symlink any `SKILL.md` folders you want into one of those directories.

## How It Feels In Practice

Once installed, you prompt OpenCode normally. The router will:

1. Inspect the request
2. Choose 3 agents that fit the work
3. Add matching skills automatically
4. Ask for approval when required
5. Continue the task with the selected team once approved

This creates a very practical orchestrator model:

- the main model coordinates
- the routed agents act like skilled workers
- specialty agents come in when the prompt calls for them

That makes it especially useful for long-running, deep work sessions where you want good delegation and strong follow-through.

## Approval Modes

The plugin supports these approval choices:

- `approve`
- `deny`
- `always`
- `global autonomous approval granted`
- `add/remove`
- `cancel`
- `never`

The plugin now explicitly tells the assistant to present these as a selectable menu using the question tool when approval is required. In runtimes that support the question tool, this gives an arrow-key menu with Enter-to-select behavior instead of typed choices.

`global autonomous approval granted` is persistent. Once selected, the plugin writes `~/.config/opencode/tri-agent-router-state.json` and will keep selecting agents and skills across future sessions without asking again.

## Updating

### Linux

Check whether an update is available:

```bash
curl -fsSL https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.sh | bash -s -- check
```

Install the latest version only if a newer version exists:

```bash
curl -fsSL https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.sh | bash -s -- update
```

Force a fresh install of the latest version:

```bash
curl -fsSL https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.sh | bash -s -- install
```

### Windows

Check for updates:

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.ps1))) -Action check
```

Update only when a newer version exists:

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.ps1))) -Action update
```

Force a fresh install:

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.ps1))) -Action install
```

### iOS

Use the same shell commands as Linux inside iSH, a-Shell, or your connected remote environment.

## Manual Installation

If you prefer not to use the scripts, copy `tri-agent-router.ts` into:

`~/.config/opencode/plugin/tri-agent-router.ts`

You can also copy `manifest.json` to keep track of the installed version, but it is optional for manual installs.

## Notes

- The updater uses GitHub raw files as the source of truth.
- `update` only replaces the installed plugin when the remote `manifest.json` version changes.
- The plugin chooses agents and skills from directories it already scans; you can add as many agents and skills as you want as long as they live in those directories.
- The better your agent and skill libraries, the stronger the routing gets.

## License

Use the repository license or add one that matches your distribution plans.
