# Tri-Agent Router + AgentTrondo

**Intelligent routing for OpenCode with elite autonomous execution.**

The Tri-Agent Router orchestrates every request through exactly three agents: one to own the work, one to catch blind spots, and one to verify quality. AgentTrondo brings Trondo's elite methodology — one approval gate, autonomous execution, and comprehensive reporting.

## What's Inside

| File | What It Does |
|------|------------|
| `tri-agent-router.ts` | Routes every request to 3 agents |
| `AgentTrondo.md` | Elite autonomous orchestrator |
| `core.ts` | Router implementation |
| `install.sh` / `install.ps1` | Install scripts |
| `manifest.json` | Package metadata |

## Quick Install

**Local:**
```bash
curl -fsSL https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.sh | bash
```

**Global:**
```bash
curl -fsSL https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.sh | bash -s -- --global
```

**Check version:**
```bash
curl -fsSL https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.sh | bash -s -- check
```

## How It Works

### The Router

Every request goes through three agents:

1. **Primary** — Owns execution
2. **Secondary** — Complementary expertise
3. **Tertiary** — Verification

The router picks agents based on your request, attaches relevant skills, and sends you an approval menu.

### AgentTrondo

Select AgentTrondo when you need:

- Multi-phase delivery
- One approval → autonomous execution
- Comprehensive final reports
- Multiphasic planning with checklists

**Usage:**
```
Select AgentTrondo as primary → Submit mission → Review plan → Approve once → Get report on completion
```

## Configuration

Edit `opencode.jsonc` to tune behavior:

```jsonc
{
  "plugin": [
    "/path/to/tri-agent-router.ts",
    {
      "agentDirs": ["/path/to/agents"],
      "skillDirs": ["/path/to/skills"],
      "maxSkills": 8,
      "minSkillScore": 16,
      "requireApproval": true
    }
  ]
}
```

| Option | Default | What It Does |
|--------|---------|-------------|
| `agentDirs` | auto | Directories to scan |
| `skillDirs` | auto | Directories to scan |
| `maxSkills` | 8 | Max skills to attach |
| `minSkillScore` | 16 | Min skill match score |
| `requireApproval` | true | Gate execution |

## Approval Menu

When execution is needed, you get a menu:

| Option | Meaning |
|--------|---------|
| `Yes` | Approve once |
| `Always` | Auto-approve this session |
| `Change` | Pick different agents |
| `Deny` | Cancel |

## Updating

```bash
curl -fsSL https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.sh | bash -s -- update
```

To update, first remove the old install, then reinstall fresh:
```bash
curl -fsSL https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.sh | bash -s -- uninstall
curl -fsSL https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.sh | bash
```

## Uninstall

```bash
curl -fsSL https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main/install.sh | bash -s -- uninstall
```

Or manually delete:
- `~/.config/opencode/plugin/tri-agent-router.ts`
- `~/.config/opencode/plugin/tri-agent-router.manifest.json`
- `AgentTrondo.md`

## Requirements

- [OpenCode CLI](https://opencode.ai/docs)
- Bash 3.2+ (or PowerShell for Windows)
- Git

## License

MIT — use it, fork it, break it.

---

Star the repo if this saves you time.