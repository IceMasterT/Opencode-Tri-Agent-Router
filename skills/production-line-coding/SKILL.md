---
name: production-line-coding
description: Enforce production-ready implementation discipline. Use when the user asks for no demos, no placeholders, no TODOs, no mocks, no stubs, complete files, robust code, exhaustive verification, or production-line work.
compatibility: opencode
metadata:
  category: development-quality
  workflow: implementation-verification
---

# Production-Line Coding

Use this skill when the user wants production-ready implementation rather than a sketch, prototype, demo, placeholder, mock, stub, or partial answer. The goal is to ship complete, maintainable, verifiable work that satisfies the requested scope without hidden gaps.

This skill does not override system, developer, project, safety, security, or explicit user instructions. It translates the user's production intent into concrete implementation and verification behavior.

## Activation Triggers

Load this skill when the request includes any of these signals:

- "production ready", "production line", "robust", "complete", "full implementation", "fully functional"
- "no demos", "no placeholders", "no TODOs", "no mocks", "no stubs", "no mock data"
- "write the whole file", "do not truncate", "do not leave anything out"
- "scan all files", "verify everything", "make sure it actually works"
- A user rejects prototype-quality work or asks to replace incomplete code with real behavior

## Core Rules

### Build the real path

- Implement the requested feature or fix end to end within the agreed scope.
- Use real integrations, real data flow, real validation at trust boundaries, and real persistence or side effects when the task requires them.
- Prefer the smallest complete implementation over broad speculative expansion.
- Preserve existing project architecture, naming, style, and test conventions unless the user asks to change them.
- If a required external dependency, credential, service, or decision is missing, stop and ask one precise blocking question instead of fabricating a substitute.

### Do not ship fake completeness

Do not introduce or leave behind:

- Demo modes presented as finished behavior
- Placeholder implementations or placeholder content
- TODO, FIXME, XXX, HACK, or "implement later" markers
- Stubbed functions that return canned values
- Mock data in production paths
- Console-only behavior when the requested deliverable requires persisted, displayed, returned, or externally observable behavior
- Silent catch blocks, swallowed errors, or success responses for failed operations
- Type suppression such as `as any`, `@ts-ignore`, or `@ts-expect-error`

Test doubles are allowed only inside test files when the test clearly needs isolation. They must not leak into runtime code or be used to simulate completion of the production path.

### Write complete artifacts

- When creating a new file, write the whole file with all imports, types, exports, and executable logic needed for it to work.
- When replacing a file, replace it with a complete file, not a fragment.
- When editing an existing file, make complete targeted changes and ensure surrounding imports, callers, types, tests, and configuration remain consistent.
- Do not use omission shorthand that tells readers repeated, unchanged, or lengthy content was skipped in generated files or user-facing code blocks.
- Do not create dead code, unused helper files, or unused configuration.

## Implementation Workflow

1. Restate the production outcome in one sentence before changing files.
2. Identify the runtime path: entry points, callers, dependencies, data contracts, configuration, and tests.
3. Inspect existing patterns before writing code.
4. Implement only the requested scope, but implement it completely.
5. Update adjacent tests or add tests in the existing test style when the codebase already has tests for comparable behavior.
6. Run static checks, tests, build commands, and a manual runtime check appropriate to the artifact.
7. Scan changed files and relevant neighboring files for forbidden incomplete-work markers.
8. Report what was changed, what passed, and any blocked checks truthfully.

## Verification Gate

Before declaring work complete, verify every applicable item:

- Changed files exist and contain complete source, not fragments.
- No forbidden markers remain in changed production files: `TODO`, `FIXME`, `XXX`, `HACK`, `placeholder`, `stub`, `mock`, `demo`, `dummy`, `sample`, `fake`, `temporary`, `later`.
- No runtime code relies on canned responses, fake data, hardcoded secrets, or disabled paths.
- Imports, exports, and public APIs align with existing project conventions.
- Type diagnostics are clean for changed files when a language server is available.
- Relevant tests pass, or any failure is identified as pre-existing or blocked with evidence.
- Build or compile passes when the project provides a build command.
- User-visible or externally visible behavior is manually checked through the real interface: browser, CLI, HTTP call, script, SDK call, or application surface.
- Security-sensitive changes are checked for secrets, injection risk, auth bypass, unsafe logging, and unintended data exposure.

Use repository-wide scans when feasible. If a full repository scan is impractical because of repository size, missing tools, generated artifacts, or permission limits, scan all changed files plus relevant callers, tests, configs, and neighboring modules, then disclose the exact scope scanned.

## Search Patterns

Use the available search tool for the environment. Prefer `rg` when installed; otherwise use an equivalent recursive search.

```bash
rg -n -i "TODO|FIXME|XXX|HACK|placeholder|stub|mock|demo|dummy|sample|fake|temporary|later" .
```

For changed-file-only verification, search the exact changed paths instead of the whole repository.

## Response Standard

Final responses must be concise and evidence-based:

- State the production outcome delivered.
- List verification commands or checks that passed.
- Name any checks that could not run and why.
- Do not claim production readiness if core checks were skipped, blocked, or failed.
- Do not present partial work as complete.

## Escalation Rules

Ask the user one precise question and stop when:

- The request requires credentials, API keys, accounts, private services, or irreversible external side effects that are not available.
- The production behavior depends on an unstated product decision.
- The user asks for mutually incompatible constraints.
- Completing the request would require unsafe, illegal, or deceptive behavior.

If a production implementation is impossible in the current environment, provide the completed local work, the exact blocker, and the smallest next action needed to finish it.
