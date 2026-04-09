---
name: refactor-guide
description: >
  Produces a safe, sequenced plan for refactoring any function, module, or
  system. Identifies what to change, in what order, and what tests must exist
  before each step. Use when user says "refactor this", "clean this up",
  "this is a mess", "how do I restructure this", "extract this into",
  "split this up", "this function is too big", or shares code they want to
  improve without changing its behaviour.
  Does NOT trigger for bug fixes — use debug-detective for that.
  Does NOT trigger for code review feedback — use code-reviewer for that.
  Does NOT trigger when the user wants to add new behaviour, only reshape
  existing behaviour.
license: MIT
metadata:
  author: sagun karanjit
  version: 1.0.0
  category: code-quality
---

# Refactor guide

## Purpose
Produce a step-by-step refactor plan that is safe to execute — meaning
each step can be verified independently and reverted if it goes wrong.
Never suggest a big-bang rewrite. Always sequence changes from lowest
to highest risk.

---

## Core principle: behaviour must not change

A refactor by definition does not change observable behaviour. Every step
in the plan must preserve:
- All existing inputs → outputs
- All existing side effects (DB writes, events emitted, logs)
- All existing error cases

If the user wants to change behaviour as part of the cleanup, that is a
separate task. Flag it and defer it: "That's a behaviour change — add it
after the refactor is stable."

---

## Step 1 — Understand the current state

Before planning, read the code and identify:

1. **What it does** — the full contract: inputs, outputs, side effects,
   error paths
2. **What makes it hard to work with** — size, nesting depth, mixed
   concerns, duplication, unclear naming, fragile dependencies
3. **What depends on it** — callers, importers, consumers of its output.
   A function called in 40 places needs more caution than one called once.
4. **What tests exist** — are the current behaviours locked by tests?
   If not, tests must be written before any refactor step begins.

If code is provided without context, ask:
> "Are there existing tests for this? And roughly how many places call
> or import it?"

---

## Step 2 — Classify the refactor type

Different refactor types have different risk profiles and sequencing rules.

### Type A — Extract function / module
Pull a coherent chunk of logic out of a large function or file into its
own named unit.
- Risk: low if the extracted unit is pure (no side effects)
- Risk: medium if it touches shared state or I/O
- Sequence: extract → test extracted unit → remove original inline code

### Type B — Rename
Rename a variable, function, class, or file to better reflect its purpose.
- Risk: low for local scope, medium for exported names, high for public API
- Sequence: rename → update all callsites → verify types/tests pass

### Type C — Flatten nesting
Reduce deeply nested conditionals or callbacks using early returns, guard
clauses, or async/await.
- Risk: low — logic is preserved, only structure changes
- Sequence: one nesting level at a time, verify after each level

### Type D — Split responsibilities
Separate a unit that does multiple things into focused units.
- Risk: medium — requires identifying clean boundaries
- Sequence: identify boundary → extract secondary concern → test both units
  → wire together → remove original

### Type E — Replace pattern
Swap one implementation pattern for another (callbacks → promises,
class → functions, raw SQL → query builder).
- Risk: high — touches call sites, types, and test fixtures
- Sequence: write new implementation alongside old → migrate one callsite
  at a time → remove old implementation last

### Type F — Consolidate duplication
Merge near-duplicate code into a single shared implementation.
- Risk: medium — must confirm the cases are truly equivalent
- Sequence: prove equivalence → write unified version → migrate → remove
  duplicates one by one

---

## Step 3 — Assess test coverage

Before producing the plan, assess test coverage honestly:

```
Test coverage assessment:
- Existing tests: [what is covered]
- Gaps: [what is NOT covered that the refactor will touch]
- Required before starting: [specific tests that must exist first]
```

If critical paths are untested, the first step of the plan is always:
**Step 0 — Write characterisation tests.**

Characterisation tests lock current behaviour without judging it. They
capture what the code does now, not what it should do. These are the
safety net for every subsequent step.

Refer to `test-writer` skill for generating these tests. Frame the
request as: "Write characterisation tests for this code before refactoring."

---

## Step 4 — Produce the refactor plan

Format each step as:

```
## Refactor plan — [unit name]

### Overview
[One paragraph: what the problem is, what the plan achieves, and the
primary risk to watch for.]

### Dependency map
[What calls or imports this unit. List files or note "internal only".]

### Step 0 — Characterisation tests (if needed)
[ ] Write tests that lock current behaviour before touching anything.
    Use test-writer skill: "characterisation tests for [unit name]"
    Verify: all tests pass on unmodified code before proceeding.

### Step 1 — [Name of first change]
Type: [Extract / Rename / Flatten / Split / Replace / Consolidate]
Risk: Low / Medium / High

What to do:
[Specific instructions — file, function, lines if known]

Verify after this step:
- [ ] Existing tests still pass
- [ ] [Specific thing to check]

Revert if: [condition that means this step went wrong]

---

### Step 2 — [Name]
[same format]

---

[Continue until refactor is complete]

---

### Final verification
- [ ] All original tests pass
- [ ] No behaviour changes observable from outside the unit
- [ ] Run `/council-review` on the refactored code
- [ ] PR description written with test-writer and pr-describer skills
```

---

## Step 5 — Sequencing rules

Always apply these ordering rules regardless of refactor type:

1. **Tests before changes** — never touch code without a safety net
2. **Low risk before high risk** — renames and extractions before
   pattern replacements
3. **Inside out** — refactor the deepest dependency first, then work
   outward to callers
4. **One concern per step** — never combine a rename with an extract
   in the same step. Each step is independently verifiable.
5. **Shared package last** — if the refactor touches the shared package
   in a monorepo, make those changes last after both frontend and backend
   are validated against the new shape

---

## Examples

### Example 1 — "This function is 200 lines, help"
**User:** pastes a large function

**Actions:**
1. Read the function — identify distinct responsibilities
2. Assess existing tests
3. If no tests: Step 0 is characterisation tests
4. Plan: extract each responsibility into a named function, one at a time
5. Each extraction is a separate step with its own verify gate

### Example 2 — "Extract this into a shared util"
**User:** points to duplicated logic across two files

**Actions:**
1. Confirm the two instances are truly equivalent (Type F)
2. If subtle differences exist, flag them — do not silently merge
3. Plan: write unified version → migrate first callsite → test →
   migrate second → remove both originals

### Example 3 — "Convert these callbacks to async/await"
**User:** shares callback-based code

**Actions:**
1. Classify as Type E — high risk, touches call sites
2. Check how many callers exist
3. Plan: write async version alongside old → migrate one caller at a time
   → verify each → remove callback version last
4. Note any error handling differences between callback and promise patterns

### Example 4 — "Refactor this AND add the new feature"
**User:** wants to clean up and extend simultaneously

**Actions:**
1. Separate the two concerns explicitly
2. Refactor plan first — no behaviour changes
3. Feature addition second — in a separate PR if possible
4. Note: "Mixing refactor and feature makes both harder to review and
   harder to revert if something breaks."

---

## Troubleshooting

**Code has no tests and is called everywhere:**
This is the highest-risk scenario. Do not skip Step 0. Write
characterisation tests for every observable behaviour before touching
a single line. The time spent on tests is insurance against a bad refactor
in a widely-used unit.

**Refactor reveals a bug in the original code:**
Stop. Document the bug. Fix it as a separate commit with its own tests
before continuing the refactor. Mixing a bug fix into a refactor makes
both impossible to isolate in git history.

**User wants to refactor across many files at once:**
Sequence by dependency order — deepest dependencies first. Do not
attempt to refactor multiple interconnected units simultaneously. Use
`/council-implement` for large multi-file refactors that need parallel
agents.

**Refactor touches the shared package:**
Flag this explicitly. A change to a shared type or util breaks both
frontend and backend simultaneously. Always make shared package changes
last, after validating both sides compile against the new shape.