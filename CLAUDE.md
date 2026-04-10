@AGENTS.md

## AI Workflow Toolkit

### Skills (auto-trigger from natural language)

| Skill | Triggers on |
|-------|------------|
| `project-planner` | plan, roadmap, milestones, scope, sprint |
| `code-reviewer` | review, check my code, PR, diff |
| `debug-detective` | broken, error, crash, stack trace, not working |
| `test-writer` | write tests, test coverage, unit tests |
| `doc-writer` | README, docstring, document this, changelog |
| `deploy-checklist` | deploy, ship, release, pre-release |
| `pr-describer` | PR description, pull request, write a PR |
| `adr-writer` | ADR, architecture decision, why did we |
| `refactor-guide` | refactor, clean up, too big, extract, split |
| `perf-profiler` | slow, sluggish, queries too long, large bundle |
| `security-auditor` | security audit, is this secure, vulnerabilities |
| `db-schema-reviewer` | migration, schema, check my schema, lock table |
| `architecture-reviewer` | where should this live, right structure, boundaries |
| `dx` | improve the DX, confusing, make this easier |

### Agents (specialist roles — invoke via orchestrator or directly)

| Agent | Purpose |
|-------|---------|
| `orchestrator` | Coordinates multi-agent workflows end-to-end |
| `product-manager` | Problem framing, RICE, acceptance criteria |
| `ux-engineer` | User flows, wireframes, component specs |
| `architecture-advisor` | Structural review, placement, ADR flags |
| `frontend-engineer` | UI, components, hooks, styles |
| `backend-engineer` | Routes, services, DB queries |
| `shared-engineer` | Shared types, utils, constants |
| `verifier` | Type check, lint, tests, smoke |
| `secret-guard` | Scans for hardcoded secrets |
| `council-reviewer` | 5-role quality gate |
| `qa-lead` | Deep test coverage audit |
| `security-reviewer` | Deep security audit |
| `context-generator` | Updates .context/PROJECT.md |
| `debt-tracker` | Scans for tech debt |
| `pr-packager` | PR description + deploy checklist |
| `onboarding-guide` | Getting-started doc |
| `brainstorm` | Divergent thinking, risk surfacing |

### Commands (invoke explicitly with /)

| Command | Purpose |
|---------|---------|
| `/preflight` | Pre-commit sanity check |
| `/council-review` | 5-role quality review (compact or full) |
| `/council-implement` | Multi-agent orchestrated implementation |
| `/architecture` | Full codebase architecture audit |
| `/skill-check` | Validate a SKILL.md before committing |
| `/skill-override` | Write a persistent rule into a skill |
| `/retro` | Post-task retrospective |

### Pipeline order

```
engineer → verifier → secret-guard → council-reviewer → context-generator → pr-packager
```

### Bootstrap meta-tooling (ships with every download, not in graph)

| File | Purpose |
|------|---------|
| `.cursor/agents/skillflow-doctor.md` | Post-install health checker for broken refs and conflicts |
| `.claude/commands/skillflow-doctor.md` | `/skillflow-doctor` command to invoke the health check |
| `INSTALL.md` | Setup guide included in every zip |
