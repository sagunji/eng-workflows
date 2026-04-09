# eng-workflows

AI-powered engineering workflows for development, code review, testing, debugging, and deployment.

A structured toolkit of **12 skills**, **12 agents**, and **6 commands** that turn common engineering tasks into repeatable, high-quality processes. Works with Claude and Cursor.

---

## How it works

The toolkit has three layers:

```
┌─────────────────────────────────────────────────────┐
│                    COMMANDS                          │
│  Orchestrated multi-step workflows you invoke        │
│  explicitly: /council-implement, /preflight, etc.    │
├─────────────────────────────────────────────────────┤
│                     AGENTS                           │
│  Specialist roles that own specific domains:         │
│  frontend-engineer, verifier, council-reviewer, etc. │
├─────────────────────────────────────────────────────┤
│                     SKILLS                           │
│  Focused capabilities that trigger automatically     │
│  from natural language: code-reviewer, test-writer   │
└─────────────────────────────────────────────────────┘
```

**Skills** activate when you describe what you need in plain language.
**Agents** are dispatched by the orchestrator or commands to do focused work.
**Commands** coordinate agents and skills into structured workflows.

---

## Getting started

### Example: build a feature from scratch

```
You: "Build a user settings page with profile editing and password change"

                          ┌──────────────┐
                          │  orchestrator │
                          │  reads task,  │
                          │  builds plan  │
                          └──────┬───────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
           ┌───────────────┐        ┌────────────────┐
           │   frontend-   │        │    backend-     │
           │   engineer    │        │    engineer     │
           │  (UI, hooks)  │        │  (API routes)   │
           └───────┬───────┘        └────────┬───────┘
                   │                         │
                   │   ┌─────────────────┐   │
                   └──►│ shared-engineer  │◄──┘
                       │ (shared types)   │
                       └────────┬────────┘
                                │
                       ┌────────▼────────┐
                       │    verifier     │
                       │ types, lint,    │
                       │ tests, build    │
                       └────────┬────────┘
                                │
                       ┌────────▼────────┐
                       │council-reviewer │
                       │ 5-role quality  │
                       │ gate            │
                       └────────┬────────┘
                                │
                       ┌────────▼────────┐
                       │  pr-packager    │
                       │ PR description, │
                       │ deploy checklist│
                       └─────────────────┘
```

### Example: debug and fix a bug

```
You: "I'm getting a TypeError: Cannot read property 'email' of null"

     ┌────────────────┐
     │debug-detective  │  ← skill triggers automatically
     │ classifies bug, │
     │ forms hypotheses│
     │ finds root cause│
     └───────┬────────┘
             │
     ┌───────▼────────┐
     │  You apply the  │
     │  suggested fix   │
     └───────┬────────┘
             │
     ┌───────▼────────┐
     │  test-writer    │  ← "write tests for the fix"
     │  locks the fix  │
     │  with tests     │
     └───────┬────────┘
             │
     ┌───────▼────────┐
     │  /preflight     │  ← pre-commit check
     │  secrets, debug │
     │  artefacts, diff│
     └────────────────┘
```

### Example: review before merging

```
You: /council-review

     ┌────────────────────────────────────────┐
     │            council-reviewer             │
     ├────────┬─────────┬────────┬────────────┤
     │Architect│QA Lead │Security│  DX  │Maint│
     │structure│coverage│vulns   │clarity│debt │
     └────┬───┴────┬────┴───┬────┴───┬───┴──┬─┘
          │        │        │        │      │
          └────────┴────────┴────────┴──────┘
                           │
                    ┌──────▼──────┐
                    │   Verdict   │
                    │ GO / REVISE │
                    │   / BLOCK   │
                    └─────────────┘
```

---

## Commands

Commands are invoked with `/command-name`. They run multi-step workflows.

### `/council-implement [task]`

Full implementation workflow with a council of agents.

**Phases:** Plan → Implement (parallel agents) → Cross-review → Consolidate → Verify → Council review → Report

**When to use:** Any task that touches multiple areas of the codebase — features, refactors, or multi-file changes.

**Example:**
```
/council-implement add email notifications when an order ships
```

The orchestrator presents a plan with subtasks, contracts, and execution order. Nothing runs until you approve.

---

### `/council-review`

Five-role quality review. Each role gives a Pass, Flag, or Block verdict.

| Role | Checks |
|------|--------|
| Architect | Structure, patterns, coupling, boundaries |
| QA Lead | Test coverage, edge cases, error paths |
| Security | Injection, auth, secrets, input validation |
| DX | Naming, clarity, error messages |
| Maintainer | Complexity, debt, hardcoded values, TODOs |

**When to use:** Before merging any PR. After implementation is verified.

**Follow-ups:**
- `full review` — detailed findings from all five roles
- `expand security` — detail on one specific role
- `fix [issue]` — apply a fix and re-run that role

---

### `/preflight`

Fast pre-commit sanity check. Five gates:

1. **Summary** — one-line commit message candidate
2. **Secrets** — hardcoded credentials or API keys
3. **Debug artefacts** — `console.log`, `debugger`, commented-out code, new TODOs
4. **Test alignment** — logic changed but no tests updated?
5. **Diff sanity** — unrelated changes mixed, accidentally staged files

**When to use:** Before every commit. Takes under a minute.

**Result:** CLEAR TO COMMIT / REVIEW FLAGS / BLOCK

---

### `/retro [type]`

Structured retrospective.

```
/retro sprint     — what shipped, what slipped, why
/retro incident   — timeline, root cause, five whys
/retro feature    — scope vs. reality, estimation accuracy
```

Produces actionable items with owners and a **skill gap report** — which skills helped, which were missing, and what to improve.

---

### `/skill-check`

Validates a `SKILL.md` file before committing. Checks frontmatter, description quality, trigger overlap with existing skills, instruction specificity, and progressive disclosure.

**When to use:** When adding or editing any skill.

---

### `/skill-override [skill] "[rule]"`

Persistent, traceable customisation of any skill.

```
/skill-override test-writer "we use Vitest, never Jest"
/skill-override code-reviewer "prefer early returns over nested if"
/skill-override deploy-checklist "skip the feature flag section"
/skill-override test-writer list              — see active overrides
/skill-override test-writer revert OVR-001    — undo an override
```

Overrides are logged with IDs, take precedence over original instructions, and can be reverted.

---

## Agents

Agents live in `.cursor/agents/`. They are specialist roles dispatched by the orchestrator or invoked directly.

### orchestrator

The master coordinator. Decomposes any task, presents a plan, waits for approval, then dispatches agents in parallel or sequence. Never writes code itself.

**How to use:** Describe any significant task. The orchestrator reads the codebase, builds a plan, and coordinates everything.

```
"Build the user settings page"
"Refactor the OrderService — it's 400 lines"
"Add webhook support to the notification system"
```

**Decision tree it follows:**

```
Frontend only?  → frontend-engineer → verifier → council-reviewer
Backend only?   → backend-engineer  → verifier → council-reviewer
Fullstack?      → agree contracts → FE + BE in parallel → shared-engineer
                  → verifier → council-reviewer
Refactor?       → refactor-guide skill → appropriate engineer(s) → verifier
```

---

### frontend-engineer

Senior frontend engineer. Implements React/Next.js features, components, pages, and hooks.

**Standards it follows:**
- TypeScript strict, no `any`
- Functional components with explicit props interfaces
- Error and loading states always handled
- Tests written alongside implementation (uses `test-writer` skill)
- JSDoc on exported functions (uses `doc-writer` skill)

---

### backend-engineer

Senior backend engineer. Implements API routes, services, controllers, and DB queries.

**Standards it follows:**
- TypeScript strict, explicit input validation on every route
- Service layer separate from route handlers
- Auth guard on every route accessing user data
- DB queries scoped to authenticated user
- Flags security concerns as `// SECURITY:` comments for the security-reviewer

---

### shared-engineer

Shared package specialist. Adds or modifies types, utilities, and constants used across frontend and backend.

**Always invoked last** — after frontend and backend are both validated. Checks for duplication before adding anything. Only pure functions, no I/O, no env vars.

---

### verifier

Sceptical end-to-end verifier. Trusts nothing. Runs type checks, linting, tests, and a fresh-clone simulation. Only auto-fixes formatting — reports everything else.

**Verification sequence:**
1. Type check (frontend + backend + shared)
2. Prettier (auto-fixes)
3. ESLint
4. Tests
5. Smoke check (entry points, exports, routes)
6. Fresh clone simulation (missing deps, undocumented env vars)

**Verdict:** SHIP or FIX FIRST (with prioritised list)

---

### council-reviewer

Five-role quality gate. Reviews all changes after verifier passes.

| Role | Verdict |
|------|---------|
| Architect | Structure, patterns, coupling |
| QA Lead | Test coverage, edge cases |
| Security | Vulnerabilities, auth, secrets |
| DX | Clarity, naming, discoverability |
| Maintainer | Debt, complexity, hardcoded values |

**Verdict:** GO / REVISE / BLOCK. Any Block = overall BLOCK.

---

### qa-lead

QA specialist. Reviews test coverage after implementation agents finish. Identifies untested paths, weak assertions, and missing edge cases. Can write missing tests but never modifies implementation code.

**Gap categories:** untested functions, missing error paths, missing boundary conditions, missing async rejection tests, missing loading/error states.

---

### security-reviewer

Security specialist. Read-only. Reviews code changes for real vulnerabilities with concrete exploitation paths. Traces every user-controlled value from input to output.

**Vectors checked:** injection, auth/authz, secrets, input validation, data exposure, CSRF/XSS, monorepo-specific risks.

---

### context-generator

Project memory agent. Builds and updates `.context/PROJECT.md` with accumulated knowledge — stack, architecture, patterns, decisions, gotchas. Invoked after features ship, after ADRs, after retros, and at session start.

**Solves:** every Cursor session starts with no memory. PROJECT.md gives all agents full context from the start.

---

### debt-tracker

Technical debt auditor. Scans for TODOs, FIXMEs, skipped tests, console.logs, large files, `any` types, empty catches, and outdated dependencies. Writes a prioritised register to `.context/DEBT.md`.

**Priority levels:**
- P1 — blocks correctness, causes active pain
- P2 — slows development, creates risk
- P3 — quality and maintainability

---

### pr-packager

PR preparation agent. Runs preflight, writes PR description, generates deploy checklist (if production), and updates context file — all in one pass.

**When to use:** When work is ready to merge. Say "prepare this PR" or "package this up."

---

### onboarding-guide

Generates a getting-started guide for new developers. Reads the codebase and `.context/PROJECT.md` to produce a practical onboarding doc covering setup, architecture, patterns, and first tasks.

---

## Skills

Skills live in `.claude/skills/`. They trigger automatically from natural language.

### Code quality

| Skill | What it does | Say this to trigger it |
|-------|-------------|----------------------|
| **code-reviewer** | Structured review across correctness, security, reliability, readability, performance, maintainability. Three severity levels. | "review this", "check my code", "look at this PR", "is this code good" |
| **refactor-guide** | Safe, sequenced refactor plan. Each step independently verifiable. Six types: extract, rename, flatten, split, replace, consolidate. | "refactor this", "clean this up", "this is a mess", "this function is too big" |

### Testing and debugging

| Skill | What it does | Say this to trigger it |
|-------|-------------|----------------------|
| **test-writer** | Unit, integration, and edge-case tests. Infers framework from repo. Covers happy paths, edge cases, error paths, boundaries. | "write tests for this", "add test coverage", "test this function" |
| **debug-detective** | Systematic diagnosis from errors, stack traces, logs, or "it's broken". Five bug categories, ranked hypotheses, confirmed root cause before any fix. | "it's not working", "I'm getting an error", "this crashes", "help me debug" |

### Performance and security

| Skill | What it does | Say this to trigger it |
|-------|-------------|----------------------|
| **perf-profiler** | Finds specific bottlenecks with evidence. Database (N+1, indexes), API (blocking I/O, leaks), frontend (re-renders, bundles), network (over-fetching). | "this is slow", "queries are taking too long", "the page is sluggish" |
| **security-auditor** | Audits across eight vectors: injection, auth, secrets, validation, data exposure, CSRF/XSS, deps, monorepo risks. Only concrete exploitation paths. | "security audit", "is this secure", "check for vulnerabilities" |
| **db-schema-reviewer** | Reviews schemas, migrations, ORM models. Lock risk, missing indexes, nullable traps, naming conventions, ORM-specific risks. | "review this migration", "check my schema", "will this lock the table" |

### Documentation and workflow

| Skill | What it does | Say this to trigger it |
|-------|-------------|----------------------|
| **doc-writer** | READMEs, docstrings/JSDoc, API references, ADRs, changelogs. Matches existing style. Audit mode for finding gaps. | "write a README", "document this", "add docstrings", "write a changelog" |
| **adr-writer** | Architecture Decision Records. Context, options, rationale, consequences. Most valuable part: what was rejected and why. | "write an ADR", "document this decision", "we decided to use X" |
| **pr-describer** | PR descriptions from diffs, commits, or descriptions. What, why, how to test, risks. Conventional commit titles. | "write a PR description", "PR for these changes" |

### Planning and deployment

| Skill | What it does | Say this to trigger it |
|-------|-------------|----------------------|
| **project-planner** | Project brief, SMART goals, milestones, sprint breakdown, task list, risk register. Works from rough descriptions. | "plan this project", "break this into tasks", "create a roadmap" |
| **deploy-checklist** | Pre-deployment gates tailored to your stack. Six phases: code, config, database, feature flags, rollback plan, post-deploy verification. | "I'm about to deploy", "ready to ship", "deploying to production" |

---

## Workflow recipes

### Ship a feature (full lifecycle)

```
 ┌─────────────────────────────────────────────────────────────┐
 │ 1. Plan                                                     │
 │    "plan this project" → project-planner                    │
 │                                                             │
 │ 2. Build                                                    │
 │    /council-implement [feature] → orchestrator dispatches   │
 │    frontend + backend + shared + verifier + council-reviewer│
 │                                                             │
 │ 3. Review                                                   │
 │    /council-review → 5-role quality gate                    │
 │                                                             │
 │ 4. Prepare                                                  │
 │    "prepare this PR" → pr-packager (preflight + PR + deploy)│
 │                                                             │
 │ 5. Deploy                                                   │
 │    "deploying to production" → deploy-checklist             │
 │                                                             │
 │ 6. Reflect                                                  │
 │    /retro feature → lessons + skill gap report              │
 └─────────────────────────────────────────────────────────────┘
```

### Fix a production bug

```
 "it's crashing with: [error]"  →  debug-detective
              │
 apply the fix
              │
 "write tests for the fix"     →  test-writer
              │
 /preflight                    →  pre-commit check
              │
 "prepare this PR"             →  pr-packager
              │
 /retro incident               →  post-incident review
```

### Improve code quality

```
 "check my schema"         →  db-schema-reviewer
 "security audit"          →  security-auditor
 "this is slow"            →  perf-profiler
 "refactor this"           →  refactor-guide
 "review this code"        →  code-reviewer
 /council-review           →  full 5-role review
```

### Maintain the toolkit

```
 /retro sprint                        →  identifies skill gaps
 /skill-check [new skill]             →  validates before commit
 /skill-override [skill] "[rule]"     →  persistent customisation
```

---

## Project structure

```
.claude/
├── commands/                          ← slash commands
│   ├── council-implement.md           multi-agent build workflow
│   ├── council-review.md              5-role quality review
│   ├── preflight.md                   pre-commit sanity check
│   ├── retro.md                       structured retrospectives
│   ├── skill-check.md                 skill file validation
│   └── skill-override.md              persistent skill customisation
└── skills/                            ← auto-triggering skills
    ├── adr-writer/SKILL.md            architecture decision records
    ├── code-reviewer/SKILL.md         structured code review
    ├── db-schema-reviewer/SKILL.md    schema and migration review
    ├── debug-detective/SKILL.md       systematic bug diagnosis
    ├── deploy-checklist/SKILL.md      pre-deployment gates
    ├── doc-writer/SKILL.md            developer documentation
    ├── pref-profiler/SKILL.md         performance bottleneck analysis
    ├── pr-describer/SKILL.md          pull request descriptions
    ├── project-planner/SKILL.md       project planning and scoping
    ├── refactor-guide.md/SKILL.md     safe refactoring plans
    ├── security-auditor/SKILL.md      security vulnerability audit
    └── test-writer/SKILL.md           test generation

.cursor/
└── agents/                            ← specialist agent roles
    ├── orchestrator.md                master coordinator
    ├── frontend-engineer.md           React/Next.js implementation
    ├── backend-engineer.md            API, services, DB
    ├── shared-engineer.md             shared types and utilities
    ├── verifier.md                    type check, lint, test, build
    ├── council-reviewer.md            5-role quality gate
    ├── qa-lead.md                     test coverage specialist
    ├── security-reviewer.md           security review (read-only)
    ├── context-generator.md           project memory (.context/)
    ├── debt-tracker.md                tech debt register
    ├── pr-packager.md                 PR preparation
    └── onboarding-guide.md            new developer guide
```
