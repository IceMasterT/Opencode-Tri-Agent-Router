# Tri-Agent Router

Global OpenCode router installed at `/home/artiq/.config/opencode/plugin/tri-agent-router.ts`.

## Global Behavior

For every prompt, job, or task, the router injects routing context before the user request:

1. Select exactly three agents:
   - Primary agent: owns execution.
   - Secondary agent: provides complementary expertise.
   - Tertiary agent: verifies quality, risk, tests, or completeness.
2. After agents are selected, select every installed skill that pertains to the request.
3. Instruct the active agent to read and apply each matching `SKILL.md` before execution.

## Sources

Agent sources include:

- `/home/artiq/.config/opencode/agent/**`
- `/home/artiq/opencode_tools/agent/**`

Skill sources include:

- `/home/artiq/.config/opencode/skills`
- `/home/artiq/.agents/skills`
- `/home/artiq/opencode_tools/open-skills/skills`

## Global Registration

The router is globally enabled from `/home/artiq/.config/opencode/opencode.jsonc`:

```jsonc
"plugin": [
  "opencode-supermemory@latest",
  "oh-my-openagent@latest",
  "/home/artiq/.config/opencode/plugin/tri-agent-router.ts"
]
```
