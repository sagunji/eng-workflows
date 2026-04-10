---
name: dx
description: >
  Audits developer experience: setup friction, confusing APIs, missing docs,
  poor error messages, slow feedback loops, and onboarding pain points.
  Use when user says "this is confusing", "improve the DX", "developer
  experience audit", "make this easier to use", "new devs struggle with this",
  "the API is hard to use", or "simplify the setup".
  Does NOT trigger for end-user UX issues — use frontend review for that.
  Does NOT trigger for performance profiling — use perf-profiler for that.
license: MIT
metadata:
  author: sagun karanjit
  version: 1.0.0
  category: quality
---

# DX (Developer Experience)

## Purpose

Evaluate and improve developer experience across a codebase, library, or
workflow. Surface friction points that slow down contributors, confuse new
team members, or make the API harder to use than it needs to be.

---

## Step 1 — Scope the audit

Determine what is being reviewed:

1. **Codebase DX** — setup, tooling, conventions, error messages
2. **API / library DX** — public surface, naming, discoverability, docs
3. **Workflow DX** — CI, testing, deploy, local dev loop speed
4. **Onboarding DX** — how quickly can someone go from clone to productive

If the user hasn't specified, ask:
> "What should I audit for DX? The full local dev experience, a specific
> API surface, or a workflow like CI/deploy?"

---

## Step 2 — Evaluate against DX dimensions

Score each applicable dimension. Use evidence from the code, not assumptions.

### Setup & onboarding
- Can a new developer go from `git clone` to running the app in under 5 minutes?
- Are prerequisites documented and version-pinned?
- Does the README cover the critical path without sending you to 4 other docs?
- Are there setup scripts or just a wall of manual steps?

### Naming & discoverability
- Can you guess what a function/module does from its name alone?
- Are related things grouped together or scattered?
- Do file names match what they export?
- Is the directory structure self-documenting?

### Error messages & failure modes
- When something breaks, does the error tell you what went wrong AND what to do?
- Are common mistakes caught with helpful validation messages?
- Do errors include enough context to debug without reading source?

### Documentation
- Is there a single entry point that orients you? (README, CONTEXT.md, etc.)
- Are non-obvious decisions explained where they matter? (not in a separate wiki)
- Are examples provided for anything with more than one way to use it?
- Is documentation kept next to the code it describes?

### Feedback loop speed
- How fast is the dev server hot reload?
- How long do tests take to run on a single file?
- Can you run just the relevant tests without waiting for the full suite?
- Is lint/typecheck fast enough to run on save?

### Consistency
- Are similar things done the same way across the codebase?
- Is there one obvious way to add a new route/component/test?
- Do naming conventions hold everywhere, or drift in older code?

---

## Step 3 — Output format

Present findings grouped by dimension. Each item gets a severity:

- 🔴 **Blocker** — new developers will get stuck here
- 🟡 **Friction** — wastes time but workaround exists
- 🔵 **Polish** — nice to fix but not painful
- ✅ **Good** — explicitly call out things that work well

```
## DX audit — [scope]

### Summary
[1-2 sentences: overall DX health and the single biggest win]

### Setup & onboarding
- 🟡 [finding]
- ✅ [finding]

### Naming & discoverability
- 🔵 [finding]

### Error messages
- 🔴 [finding]

### Documentation
- 🟡 [finding]

### Feedback loop
- ✅ [finding]

### Consistency
- 🔵 [finding]

### Recommended actions (priority order)
1. [highest impact fix]
2. [next]
3. [next]
```

---

## Step 4 — Actionable recommendations

Every finding must include:
- **What** is the problem (specific, with file/line if applicable)
- **Why** it hurts DX (not just "it's not ideal" — who gets stuck and when)
- **How** to fix it (concrete suggestion, not "improve this")

Prefer small, incremental improvements over rewrites. The goal is to reduce
friction without creating churn.

---

## Examples

### Example 1 — Codebase DX audit
**User:** "Audit the DX of this project"

**Actions:**
1. Read README, CONTEXT.md, package.json, and directory structure
2. Try the setup path mentally — what would a new dev need to do?
3. Check error handling patterns, naming consistency, test speed
4. Report with severity-tagged findings and prioritized fixes

### Example 2 — API surface review
**User:** "Is this hook easy to use?"

**Actions:**
1. Read the hook's signature, return type, and JSDoc
2. Check if the API is predictable from the name alone
3. Look for footguns: easy-to-misuse params, silent failures, missing types
4. Suggest naming/signature/doc improvements

### Example 3 — Onboarding friction
**User:** "New devs struggle to get started"

**Actions:**
1. Walk through clone → install → run → first-change → test cycle
2. Time each step mentally, flag anything that requires tribal knowledge
3. Check for missing prereqs, unclear env setup, undocumented gotchas
4. Recommend a setup script or improved README section

---

## Troubleshooting

**User says "everything is fine":**
Push back gently. Check error messages for a common mistake scenario,
look for inconsistencies in older code, and verify the README matches
the actual setup steps. There is always something.

**Scope is too broad:**
Narrow to the area with the most developer traffic (usually: setup,
the main feature development loop, and test running).

**User wants metrics:**
Suggest measuring: time-to-first-commit for new devs, test suite runtime,
CI pipeline duration, and frequency of "how do I..." questions in chat.
