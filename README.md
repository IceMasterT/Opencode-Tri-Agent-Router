# OpenCode Tri-Agent Router

A powerful OpenCode plugin that orchestrates multi-agent workflows with intelligent routing, skill matching, and autonomous execution capabilities.

## Features

- **Three-Agent Routing**: Selects exactly 3 agents per request (primary, secondary, tertiary)
- **Skill Auto-Matching**: Automatically attaches relevant skills based on request context
- **Approval Modes**: Flexible approval flow with session and global autonomous options
- **AgentTrondo Integration**: Built-in autonomous orchestrator with Trondo's deep reasoning
- **Menu-Based Approval**: Presents approval choices as selectable menus

## What's New

### AgentTrondo - Autonomous Multi-Phase Orchestrator

AgentTrondo is an autonomous orchestrator that leverages Trondo's reasoning methodology:

- **One-Time Approval**: Requests approval once at mission start, then operates autonomously
- **Multiphase Planning**: Creates structured execution plans with clear phases and checklists
- **Silent Execution**: No user interaction after approval until completion
- **Comprehensive Reports**: Delivers full summary only upon mission completion
- **Forbidden File Protection**: Still prompts for approval on sensitive files (.env, .key, .secret, .git, node_modules)

## Installation

Installer behavior:
- Installs `tri-agent-router.ts` plugin assets
- Installs `agent-trondo/*` assets and `skills/*` bundle from manifest
- Copies AgentTrondo into picker paths:
  - `~/.config/opencode/agent/core/agenttrondo.md`
  - `~/.config/opencode/.opencode/agents/agent-trondo.md`

### Install (Local)

Install to your project's `.opencode/plugin/` directory:

```bash
curl -fsSL https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.sh | bash -s -- install
```

### Install Global

Install globally to `~/.opencode/plugin/`:

```bash
curl -fsSL https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.sh | bash -s -- install --global
```

### Custom Directory

Install to a custom directory:

```bash
curl -fsSL https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.sh | bash -s -- install --dir "/path/to/plugin/directory"
```

## Uninstall

### Using curl

```bash
curl -fsSL https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.sh | bash -s -- uninstall
```

### Manual Uninstall

1. Delete the plugin files:
   - `~/.config/opencode/plugin/tri-agent-router.ts`
   - `~/.config/opencode/plugin/tri-agent-router.manifest.json`
   - `~/.config/opencode/agent/AgentTrondo.md`
   - `~/.config/opencode/.opencode/agents/agent-trondo/`

2. If installed globally, also delete:
   - `~/.opencode/plugin/tri-agent-router.ts`
   - `~/.opencode/plugin/tri-agent-router.manifest.json`

## AgentTrondo Usage

When AgentTrondo is selected as the primary agent:

1. **Submit your mission** - Describe what you want to accomplish
2. **Review the plan** - AgentTrondo generates a multiphased plan with checklist
3. **Approve once** - After approval, AgentTrondo executes autonomously
4. **Receive report** - Get comprehensive completion summary when done

### AgentTrondo Modes

| Mode | Description |
|------|-------------|
| `quick` | Fast orchestration for contained objectives |
| `deep` | Structured multi-phase delivery with validation |
| `ultrawork` | Long-horizon execution with stacked planning |

### AgentTrondo Reasoning Phases

1. **God Mode Activation** - Scan for hidden intent, skill signals
2. **Problem Absorption** - Model the real problem behind the request
3. **Multiverse Decomposition** - Generate solution timeline options
4. **Master Strategist** - Select paradigms and security posture
5. **Creative Synthesis** - Fuse strongest approaches into design
6. **Execution Ritual** - Translate reasoning into implementation
7. **Post-Game Domination** - Anticipate next requests

## Update

Check for updates:

```bash
curl -fsSL https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.sh | bash -s -- check
```

Update to latest version:

```bash
curl -fsSL https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.sh | bash -s -- update
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `agentDirs` | `string[]` | Auto-detected | Directories to scan for agents |
| `skillDirs` | `string[]` | Auto-detected | Directories to scan for skills |
| `maxSkills` | `number` | `8` | Maximum skills to attach |
| `minSkillScore` | `number` | `16` | Minimum score for skill matching |
| `announceNoSkills` | `boolean` | `false` | Show message when no skills match |
| `requireApproval` | `boolean` | `true` | Require approval before execution |

## Approval Modes

| Mode | Behavior |
|------|----------|
| `approve` | Approve current request only |
| `always` | Approve all future requests this session |
| `autonomous approve` | Approve and continue without asking |
| `deny` | Reject selection, draft new one |
| `add/remove` | Modify agent/skill selection |
| `cancel` | Execute without agents/skills |
| `never` | Disable routing for session |

## Agent Discovery Paths

The router automatically scans these directories for agents:

- `<project>/.opencode/agent`
- `<project>/.opencode/agents`
- `~/.config/opencode/agent`
- `~/.config/opencode/.opencode/agents`

## Skill Discovery Paths

The router automatically scans these directories for skills:

- `<project>/.opencode/skills`
- `~/.config/opencode/skills`
- `~/.agents/skills`
- `~/open-skills/skills`

## License

MIT
