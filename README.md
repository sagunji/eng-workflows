# Full-Stack Dev Toolkit

An AI-powered development toolkit that brings structured engineering practices to your workflow. It includes **12 specialist skills** that activate automatically based on what you say, and **6 slash commands** for orchestrated multi-step workflows.

## Quick start

Skills trigger automatically from natural language. Just describe what you need:

| You say | Skill that activates |
|---------|---------------------|
| "review this code" | code-reviewer |
| "it's not working" | debug-detective |
| "write tests for this" | test-writer |
| "I'm about to deploy" | deploy-checklist |
| "refactor this" | refactor-guide |
| "this is slow" | perf-profiler |

Commands are invoked explicitly for structured workflows:

```
/council-implement build the user settings page
/council-review
/preflight
```

## Commands

### `/council-implement`

Orchestrates a council of specialist agents (frontend engineers, backend engineers, shared-package engineer) to plan, implement, cross-review, and verify a task across a fullstack monorepo. Runs through seven phases:

1. **Plan** — decomposes the task, defines contracts, waits for your approval
2. **Implement** — dispatches parallel subagents scoped to specific files
3. **Cross-review** — each engineer's work is peer-reviewed by another
4. **Consolidate** — deduplicates logic, unifies types, removes dead code
5. **Verify** — type checks, linting, formatting, tests
6. **Council review** — five-role review (Architect, QA, Security, DX, Maintainer)
7. **Report** — structured summary of everything that happened

Use for any task that touches multiple areas of the codebase.

### `/council-review`

Runs a five-role review against a file, staged changes, or a diff:

| Role | Focus |
|------|-------|
| Architect | Structure, patterns, coupling |
| QA Lead | Test coverage, edge cases, error paths |
| Security | Vulnerabilities, secrets, injection, auth |
| DX | Clarity, naming, discoverability |
| Maintainer | Complexity, duplication, long-term health |

Each role gives a verdict: Pass, Flag, or Block. Any Block means NO-GO.

Default output is a compact table. Say `full review` or `expand [role]` for detailed findings.

### `/preflight`

Fast pre-commit sanity check. Runs five gates against staged changes:

1. **Summary** — one-line description of the change (commit message candidate)
2. **Secrets** — scans for hardcoded credentials or API keys
3. **Debug artefacts** — `console.log`, `debugger`, commented-out code, new TODOs
4. **Test alignment** — logic changed but tests weren't?
5. **Diff sanity** — unrelated changes mixed together, accidentally staged files

Run before every commit. Say `full review` to escalate to `/council-review`.

### `/retro`

Structured retrospective for sprints, incidents, or completed features. Produces:

- Root-cause analysis (not just symptoms)
- Actionable items with owners and due dates
- A **skill gap report** that identifies which `.claude/skills/` helped, which were missing, and which should be improved

```
/retro sprint     — end-of-sprint retrospective
/retro incident   — post-incident review
/retro feature    — post-feature review
```

### `/skill-check`

Validates a `SKILL.md` file before you commit it. Checks:

- Frontmatter structure and naming
- Description quality and trigger phrases
- Trigger overlap with existing skills
- Instruction specificity and examples
- Progressive disclosure (body vs. `references/` split)

Use when adding or editing any skill.

### `/skill-override`

Writes persistent, traceable preferences into a skill without editing its core instructions. Overrides are logged with IDs and can be reverted.

```
/skill-override test-writer "we use Vitest, never Jest"
/skill-override code-reviewer "prefer early returns over nested if"
/skill-override project-planner "default sprint length is 1 week" --reason "weekly releases"
/skill-override test-writer list
/skill-override test-writer revert OVR-001
```

Overrides take precedence over original instructions and are tracked in an append-only log inside the skill file.

## Skills

### Code quality

**code-reviewer** — Reviews code for logic bugs, style issues, naming, complexity, and anti-patterns. Produces structured findings at three severity levels (Critical, Major, Minor) across six dimensions: correctness, security, reliability, readability, performance, maintainability.

> Triggers: "review this", "check my code", "look at this PR", "what's wrong with this", "is this code good"

**refactor-guide** — Produces a safe, sequenced refactor plan. Each step is independently verifiable and revertable. Covers six refactor types: extract, rename, flatten, split, replace pattern, consolidate. Always requires tests before any code changes.

> Triggers: "refactor this", "clean this up", "this is a mess", "this function is too big", "split this up"

### Testing and debugging

**test-writer** — Generates unit, integration, and edge-case tests. Infers the test framework from your repo. Covers happy paths, edge cases, error paths, and boundary conditions in Arrange/Act/Assert format.

> Triggers: "write tests for this", "add test coverage", "test this function", "I need tests before refactoring"

**debug-detective** — Systematically diagnoses bugs from error messages, stack traces, logs, or vague descriptions. Classifies bugs into five categories (runtime, logic, integration, concurrency, silent failure), forms ranked hypotheses, and confirms root cause before proposing a fix.

> Triggers: "it's not working", "I'm getting an error", "this crashes", "why is this failing", "help me debug"

### Performance and security

**perf-profiler** — Finds specific performance bottlenecks with evidence. Covers four domains: database/ORM (N+1, missing indexes), API/backend (blocking I/O, memory leaks), frontend/React (re-renders, bundle size), and network (over-fetching, missing compression).

> Triggers: "this is slow", "queries are taking too long", "the page is sluggish", "bundle is too large", "memory keeps growing"

**security-auditor** — Audits code across eight vectors: injection, auth/authz, secrets, input validation, data exposure, CSRF/XSS, dependencies, and monorepo-specific risks. Only reports findings with concrete exploitation paths.

> Triggers: "security audit", "is this secure", "check for vulnerabilities", "audit this endpoint"

**db-schema-reviewer** — Reviews schemas, migrations, and ORM models for missing indexes, unsafe migrations, nullable traps, naming issues, and lock risks. Knows the differences between Postgres, MySQL, and SQLite lock behaviour.

> Triggers: "review this migration", "check my schema", "is this migration safe", "will this lock the table"

### Documentation and workflow

**doc-writer** — Writes READMEs, docstrings/JSDoc, API references, ADRs, changelogs, and inline comments. Matches existing style. Also runs in audit mode to find missing, outdated, or redundant documentation.

> Triggers: "write a README", "document this", "add docstrings", "write a changelog", "document this API"

**adr-writer** — Writes Architecture Decision Records. Captures context, options considered, rationale, and consequences. The most valuable part: what was rejected and why.

> Triggers: "write an ADR", "document this decision", "we decided to use X", "why did we pick X over Y"

**pr-describer** — Writes PR descriptions from diffs, commit logs, or plain descriptions. Covers what, why, how to test, and risks. Generates conventional-commit-format titles.

> Triggers: "write a PR description", "PR for these changes", "help me describe this PR"

### Planning and deployment

**project-planner** — Turns any project description into a structured plan: goals, milestones, sprint breakdown, task list, and risk register. Works with rough descriptions, uploaded docs, or bullet points.

> Triggers: "plan this project", "break this into tasks", "create a roadmap", "help me scope this"

**deploy-checklist** — Generates a pre-deployment checklist tailored to your stack and environment. Six phases: code/build, config/secrets, database/migrations, feature flags, rollback plan, post-deploy verification. Includes stop conditions that block unsafe deploys.

> Triggers: "I'm about to deploy", "pre-release checklist", "ready to ship", "deploying to production"

## Common workflows

### Building a feature end-to-end

```
1. /council-implement [describe the feature]     — plan and build
2. /preflight                                     — check before committing
3. "write a PR description"                       — pr-describer generates it
```

### Reviewing before merge

```
1. /council-review                                — five-role review
2. "is this secure"                               — security-auditor deep dive
3. "review this migration"                        — db-schema-reviewer if DB changes
```

### Debugging a production issue

```
1. "it's crashing with this error: [paste]"       — debug-detective investigates
2. "write tests for the fix"                      — test-writer locks the fix
3. /preflight                                     — sanity check
4. /retro incident                                — post-incident review
```

### Preparing a release

```
1. /council-review                                — final review
2. "security audit on the auth changes"           — security-auditor
3. "I'm deploying to production"                  — deploy-checklist
```

### Improving the toolkit itself

```
1. /retro sprint                                  — identifies skill gaps
2. /skill-check [new or edited skill]             — validates before commit
3. /skill-override [skill] "[preference]"         — persistent customisation
```

## How skills and commands relate

Commands orchestrate multi-step processes and often invoke skills internally:

- `/council-implement` uses **test-writer**, **doc-writer**, **code-reviewer**, and **council-review** during its phases
- `/council-review` applies the same severity framework as **code-reviewer** and **security-auditor**
- `/retro` produces a skill gap report that feeds back into improving the skills themselves
- `/preflight` can escalate to `/council-review` for deeper analysis

Skills are focused specialists. Commands are workflows that coordinate them.

## Customising behaviour

Use `/skill-override` to adapt any skill to your team's conventions without editing the skill files directly:

```
/skill-override test-writer "we use Vitest, never Jest"
/skill-override code-reviewer "always prefer const over let"
/skill-override deploy-checklist "skip the feature flag section"
/skill-override project-planner "default sprint = 1 week"
/skill-override perf-profiler "we use Prisma, not raw SQL"
```

Overrides are tracked, versioned, and reversible. Run `/skill-override [skill] list` to see active overrides.

## Project structure

```
.claude/
├── commands/
│   ├── council-implement.md    — multi-agent build orchestration
│   ├── council-review.md       — five-role code review
│   ├── preflight.md            — pre-commit sanity check
│   ├── retro.md                — structured retrospectives
│   ├── skill-check.md          — skill file validation
│   └── skill-override.md       — persistent skill customisation
└── skills/
    ├── adr-writer/             — architecture decision records
    ├── code-reviewer/          — structured code review
    ├── db-schema-reviewer/     — schema and migration review
    ├── debug-detective/        — systematic bug diagnosis
    ├── deploy-checklist/       — pre-deployment gates
    ├── doc-writer/             — developer documentation
    ├── pref-profiler/          — performance bottleneck analysis
    ├── pr-describer/           — pull request descriptions
    ├── project-planner/        — project planning and scoping
    ├── refactor-guide.md/      — safe refactoring plans
    ├── security-auditor/       — security vulnerability audit
    └── test-writer/            — test generation
```
