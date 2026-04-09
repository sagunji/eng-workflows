---
description: >
  Runs a structured retrospective on a sprint, incident, or completed
  feature. Produces root-cause analysis, actionable items with owners,
  and a skill-gap report that feeds back into improving .claude/ skills
  and commands. Say "retro sprint", "retro incident", or "retro feature"
  to invoke.
---

# Retro

Run a structured retrospective on a sprint, incident, or completed feature.
Produces actionable findings — not just a list of feelings.

---

## Usage

```
/retro sprint          ← end-of-sprint retrospective
/retro incident        ← post-incident review
/retro feature         ← post-feature or post-milestone review
```

Provide context as free text after the command, or answer the questions
that follow. The more specific the input, the more useful the output.

---

## Step 1 — Gather context

Ask for whatever is missing from the user's input:

**For sprint:**
- What was planned vs. what shipped?
- What slipped and why?
- Any recurring friction?

**For incident:**
- What happened? (timeline if known)
- What was the impact? (duration, users affected, data affected)
- How was it detected and resolved?
- What was the root cause?

**For feature:**
- What was the original scope vs. what shipped?
- What took longer than expected?
- What would you do differently?

Ask at most two questions at once. Work with partial information rather
than blocking on completeness.

---

## Step 2 — Run the retrospective

### For sprint and feature retros

Analyse across four dimensions:

**What worked**
- Specific things that went well and why
- Patterns worth repeating
- Skills or tools that helped

**What didn't work**
- Specific friction points with root causes
- Not symptoms ("PRs were slow") but causes ("PRs were slow because
  there were no agreed review SLAs")

**Surprises**
- Things that took longer or shorter than expected
- Unknowns that became known during the work
- Assumptions that turned out to be wrong

**Skill and tooling gaps**
- Was there a moment where a skill or command from `.claude/skills/`
  or `.claude/commands/` would have helped but wasn't used or doesn't exist?
- Should any skill be added, improved, or triggered differently?

---

### For incident retros

Structure as a blameless post-mortem:

**Timeline**
[Reconstruct from input: when did it start, when detected, when resolved]

**Root cause**
[Single statement — same format as debug-detective root cause]

**Contributing factors**
[What conditions allowed the root cause to have impact]

**Detection gap**
[How long between onset and detection, and why]

**Response assessment**
[What went well in the response, what slowed it down]

**Five whys**
Work through the root cause:
1. Why did X happen?
2. Why did that happen?
3. ...until systemic cause is reached (usually 3–5 levels)

---

## Step 3 — Action items

Every retro must produce action items. Findings without actions are
just documentation of failure.

Format:
```
## Action items

| Action | Owner | Due | Linked to |
|--------|-------|-----|-----------|
| [Specific, imperative action] | [Role or name] | [Sprint N or date] | [Finding] |
```

Rules:
- Actions must be specific and verifiable — not "improve communication"
  but "add a daily standup async update to the #dev Slack channel"
- Every finding in "What didn't work" must have at least one action
- Actions are linked back to the finding that generated them
- If an action would be handled by improving a skill or adding a command,
  say so explicitly:
  > "Add a `refactor-guide` skill to `.claude/skills/` — would have helped
  > during the UserService refactor that stalled the sprint."

---

## Step 4 — Skill and tooling gap report

After every retro, explicitly assess the `.claude/` setup:

```
## Skill gap report

### Skills that helped
- [skill-name] — [how it was used]

### Skills that were missing
- [Describe the gap] → Suggested skill: [name]

### Skills that triggered incorrectly
- [skill-name] — [what happened] → Fix: [description tweak]

### Commands that would have helped
- [Describe the moment] → Suggested command: [name]
```

This section feeds directly into the next iteration of the skills setup.
Over time, the retro command becomes the mechanism by which your
`.claude/` folder improves sprint over sprint.

---

## Format output

```
## Retro — [sprint/incident/feature] — [date]

### Summary
[2–3 sentences: overall assessment]

### What worked
- [Finding]

### What didn't work
- [Finding + root cause]

### Surprises
- [Finding]

### Action items
[Table]

### Skill gap report
[Section]
```

---

## Examples

### `/retro sprint`
User provides: "We shipped the auth refactor but missed the dashboard
feature. PRs took forever to merge."

Output: Root cause analysis on PR slowness, action item to establish
review SLAs, assessment of whether `code-reviewer` or `pr-describer`
skills were used effectively.

### `/retro incident`
User provides: "Production was down for 40 minutes last Tuesday.
A migration locked the users table."

Output: Timeline reconstruction, five whys leading to "migrations were
not tested against production-sized data", action item to add that gate
to `deploy-checklist`, skill gap noting that `deploy-checklist` has this
gate but it wasn't run.

### `/retro feature`
User provides: "The billing module took 3 sprints instead of 1."

Output: Scope creep analysis, estimation failure root cause, action items
for better milestone exit criteria, suggestion to use `project-planner`
earlier with stricter exit criteria per milestone.