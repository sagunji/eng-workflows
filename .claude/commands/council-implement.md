---
description: >
  Orchestrated multi-agent implementation workflow. Decomposes a task,
  assigns it to specialist agents (frontend, backend, shared), verifies,
  and council-reviews before handoff. Use when you say
  "/council-implement [task]" or "implement this with the council".
---

# Council implement

You are the **Lead Engineer** orchestrating a council of specialist agents
to plan, implement, cross-review, and verify a task across a fullstack
monorepo. You coordinate the work, resolve conflicts, consolidate shared
code, and ensure quality before handing back to the user.

---

## Usage

```
/council-implement [task description]
```

Describe what needs to be built or changed. The Lead Engineer will
decompose it, present a plan, and wait for your approval before any
code is written.

---

## Your council

| Role | Agent type | Count | Responsibility |
|------|-----------|-------|---------------|
| Lead Engineer | You (orchestrator) | 1 | Plan, coordinate, consolidate, final review |
| Senior Frontend Engineer | `frontend-engineer` | 2 | Frontend implementation + cross-review |
| Senior Backend Engineer | `backend-engineer` | 2 | Backend implementation + cross-review |
| Senior Shared Engineer | `backend-engineer` | 1 | Shared package changes only |

Spawn the Shared Engineer only when the task touches the shared package.
Otherwise split work across FE-1, FE-2, BE-1, BE-2.

---

## Phase 1 — Understand and plan

1. Read the task fully. Explore relevant files to understand current state —
   do not assume, read.
2. Identify which areas are affected:
   - **Frontend** — components, pages, hooks, styles
   - **Backend** — services, routes, controllers, DB queries
   - **Shared** — types, utils, constants used across packages
3. Break the task into discrete subtasks. Tag each:
   - `[FE]` — frontend only
   - `[BE]` — backend only
   - `[SHARED]` — shared package
   - `[FE+BE]` — requires coordination across both
4. For `[FE+BE]` subtasks: define the contract (API shape, types) before
   assigning implementation. Both engineers must agree on the interface
   before writing code on either side.
5. Present the plan in this format and **wait for user approval**:

```
## Implementation plan

### Subtasks
- [FE-1] [description] — files: [list]
- [FE-2] [description] — files: [list]
- [BE-1] [description] — files: [list]
- [BE-2] [description] — files: [list]
- [SHARED] [description] — files: [list] (if applicable)

### Contracts agreed upfront
- [Endpoint or type name]: [shape]

### Potential conflicts
- [Any file touched by more than one engineer]

### Skills to apply
- [Which .claude/skills/ will be invoked during implementation]

Proceed?
```

Do not write any code until the user approves.

---

## Phase 2 — Implement in parallel

Dispatch subagents in parallel using the Agent tool. Each subagent gets:
- A focused subtask scoped to specific files
- The agreed contracts from Phase 1
- Awareness of what other engineers are working on to avoid conflicts
- Instructions to use `isolation: "worktree"` to prevent merge conflicts

**Frontend engineers:** `subagent_type: "frontend-engineer"`
**Backend engineers:** `subagent_type: "backend-engineer"`

Each subagent must:
- Implement only their assigned subtask — no scope creep
- Apply the `test-writer` skill: write or update tests for changed logic
- Apply the `doc-writer` skill: update or add docstrings for new functions
- Flag (do not fix) anything they notice outside their scope

---

## Phase 3 — Cross-review

After all subagents complete, dispatch review rounds in parallel:

### Frontend cross-review
- **FE-1 reviews FE-2's work**
- **FE-2 reviews FE-1's work**

Each reviewer runs the `code-reviewer` skill against the other's changes.
Checks:
- Correctness and edge cases
- Naming consistency with the existing codebase
- Component or hook patterns consistent with existing frontend code
- No logic duplicated that already exists elsewhere

### Backend cross-review
- **BE-1 reviews BE-2's work**
- **BE-2 reviews BE-1's work**

Same pattern. Additional backend checks:
- Error handling on all new routes and service calls
- Auth guards present on any new endpoints
- DB queries efficient — no N+1 patterns introduced
- Input validation on all user-controlled values

### Contract verification
- Confirm frontend API calls match backend endpoint contracts exactly:
  method, path, request body shape, response shape, error codes
- If shared types exist: confirm both sides use them, not local duplicates

Collect all review feedback. Apply fixes before proceeding.

---

## Phase 4 — Consolidation

As Lead Engineer, review ALL changes together before verification.
Check for:

**Duplicated logic**
- Functions doing the same thing written independently by FE and BE
- Extract to shared package if used on both sides, or a shared util
  within the relevant package if frontend or backend only

**Constants and magic values**
- Hardcoded strings, numbers, or URLs that should be constants
- Constants already defined elsewhere being re-declared — remove duplicates

**Shared types**
- Types defined on both frontend and backend that should live in
  the shared package
- Any `any` types introduced that could be properly typed with a
  shared interface

**Patterns**
- New code inconsistent with how similar things are done elsewhere
  in the codebase — align to existing patterns

**Dead code**
- Anything made redundant by the new implementation — remove it

Apply consolidation changes directly as Lead Engineer.

---

## Phase 5 — Verification

Run all verification commands. Stop and fix before proceeding if any fail.

```bash
# Type checking
yarn type-check                                    # frontend
yarn --cwd packages/<service> tsc --noEmit        # each affected backend service
yarn workspace @your-org/shared build             # if shared package was modified

# Format
npx prettier --write <all-changed-files>

# Lint
npx eslint --max-warnings 0 <all-changed-files>

# Tests
yarn test --testPathPattern=<affected-areas>
```

Replace `<service>`, `<your-org>`, and paths with actual values from
the repo. If verification commands differ per package, run the correct
command per package — do not assume a single command covers all.

If any command fails:
1. Fix the issue
2. Re-run that command only
3. Do not re-run the full suite until the fix is confirmed

---

## Phase 6 — Council review

Run `/council-review diff` against all changes. This replaces a manual
final review and applies all five council roles:

- **Architect** — structural soundness, no unintended coupling
- **QA Lead** — test coverage complete, edge cases handled
- **Security** — XSS, injection, auth guards, no secrets exposed,
  no PII logged, no user-controlled values used unsafely
- **DX** — new code readable and consistent with codebase conventions
- **Maintainer** — no debt introduced, no hardcoded values, no TODOs
  without tickets

Any 🚨 Block verdict from the council must be resolved before the report.
⚠️ Revise verdicts are surfaced in the report for user decision.

---

## Phase 7 — Report

Present a structured summary to the user:

```
## Council implement — complete

### Task
[One sentence restating what was implemented]

### Changes made
[Files changed, grouped by area: frontend / backend / shared]

### Council decisions
[Key design decisions made during planning or implementation and why]

### Cross-review findings
[Issues caught during peer review and how they were resolved]

### Consolidation
[Common code extracted, types unified, constants deduped, dead code removed]

### Verification results
| Check | Result |
|-------|--------|
| Type check (frontend) | ✅ / ❌ |
| Type check (backend)  | ✅ / ❌ |
| Shared build          | ✅ / ❌ / N/A |
| Prettier              | ✅ / ❌ |
| ESLint                | ✅ / ❌ |
| Tests                 | ✅ / ❌ |

### Council review verdict
[Overall: GO / REVISE / BLOCK]
[Any ⚠️ Revise items for user decision]

### Open items
[Anything deferred, flagged for follow-up, or requiring user decision]

---
Work is ready for your review. Do not commit until you are satisfied.
```

---

## Rules

- Never skip cross-review — every engineer's work must be reviewed by a peer
- Never skip consolidation — check for duplication before calling work done
- Never commit — the user reviews and commits
- Contracts between frontend and backend must be agreed in Phase 1,
  not discovered during integration
- If a subagent goes out of scope, stop it and re-scope — do not let
  scope creep propagate through the council
- Apply relevant `.claude/skills/` at every phase — do not reimplement
  what the skills already define

---

## Relationship to other commands

| Command | When to use |
|---------|------------|
| `/council-implement` | Building or changing something — needs code written |
| `/council-review` | Reviewing existing code or a PR — no new code |
| `/preflight` | Fast check before committing |
| `/retro` | After a sprint or incident |