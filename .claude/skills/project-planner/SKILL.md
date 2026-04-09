---
name: project-planner
description: >
  Structures and plans any software or creative project from scratch or an
  existing brief. Creates goals, milestones, sprints, task breakdowns, and
  risk registers. Use when the user says "plan this project", "break this
  into tasks", "create a roadmap", "help me scope this", "write a project
  brief", "estimate this", or "I need to organise this work". Works with
  plain descriptions, uploaded docs, or rough bullet points as input.
  Does NOT trigger for general coding help or single-task requests.
license: MIT
metadata:
  author: sagun karanjit
  version: 1.0.0
  category: project-management
---

# Project Planner

## Purpose
Turn any project description — however rough — into a structured, actionable
plan: goals, milestones, sprint breakdown, task list, and a risk register.

---

## Step 1 — Intake and clarification

Before planning, extract these five things from what the user has provided.
If any are missing, ask for them in a single grouped question (never fire
questions one at a time):

1. **Outcome** — What does done look like? What is the single most important
   deliverable?
2. **Constraints** — Deadline, team size, budget, or tech stack limits?
3. **Unknowns** — What is least clear right now?
4. **Stakeholders** — Who reviews or approves work?
5. **Existing assets** — Any code, designs, or docs already in place?

If the user's message is detailed enough to infer all five, skip directly to
Step 2 and note your assumptions at the top of the plan.

---

## Step 2 — Generate the plan

Produce the following sections in order. Use Markdown headers.

### 2a. Project brief (3–5 sentences)
State what is being built, why it matters, and what success looks like.
No jargon. A new team member should understand it immediately.

### 2b. Goals (SMART format)
List 3–5 goals. Each must be:
- **Specific** — names the deliverable
- **Measurable** — has a number or binary done/not-done criterion
- **Time-bound** — has a target date or sprint number

### 2c. Milestones
Group work into 3–6 milestones. For each:
- Name (short noun phrase)
- Description (one sentence)
- Exit criterion (how you know it's done)
- Estimated duration

### 2d. Sprint breakdown
If an end date or velocity hint was given, assign milestones to sprints
(default: 2-week sprints). Produce a simple table:

| Sprint | Goal | Key deliverables | Dependencies |
|--------|------|------------------|--------------|

### 2e. Task list
For the first milestone only, generate a full task list. Each task:
- Written as an imperative verb phrase ("Write the auth module", not "Auth")
- Tagged with type: `[dev]`, `[design]`, `[research]`, `[review]`, `[ops]`
- Given a rough size: `S` (< 2h), `M` (half day), `L` (full day), `XL` (2+ days)
- Flagged with a blocker if it depends on another task

Ask the user if they want task lists generated for subsequent milestones.

### 2f. Risk register
Identify 3–5 risks. For each:

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|

Likelihood and Impact: High / Medium / Low.

---

## Step 3 — Output format

Default output is Markdown suitable for pasting into Notion, Linear, or a
README. If the user asks for a different format (CSV, JSON, table-only),
reformat without re-planning.

Offer at the end:
> "Want me to generate tasks for the remaining milestones, export this as a
> Notion-ready doc, or refine any section?"

---

## Examples

### Example 1 — Vague brief
**User:** "I want to build a recipe app."

**Actions:**
1. Note missing constraints (no deadline, no team size, no platform stated)
2. Ask one grouped question covering outcome, constraints, unknowns
3. On response, produce full plan

### Example 2 — Detailed brief
**User:** "We need a B2B SaaS dashboard for logistics companies. React
frontend, Node backend, Postgres. 4 engineers, ship in 12 weeks."

**Actions:**
1. All five intake items are inferable — proceed directly
2. Note assumptions: "Assuming 2-week sprints, no existing codebase, one
   designer available."
3. Produce full plan with 6 sprints

### Example 3 — Existing project, needs re-planning
**User:** "Here's our backlog [paste]. We've missed two deadlines. Help."

**Actions:**
1. Analyse provided backlog for scope creep, missing exit criteria, and
   unsequenced dependencies
2. Produce a revised milestone map and flag the top 3 root causes of slippage
3. Suggest a recovery sprint structure

---

## Troubleshooting

**Plan feels too high-level:**
Ask the user to pick one milestone and generate the full task list for it.
Depth comes from narrowing scope, not lengthening the document.

**User keeps changing requirements mid-plan:**
Introduce a change log section at the top of the plan. Each change gets a
date, a description, and a note on which milestones it affects.

**No deadline given:**
Default to relative timing ("Week 1–2", "Sprint 3") rather than calendar
dates. Note this at the top of the plan.

**Project is non-software (event, marketing campaign, research):**
The structure is identical. Swap `[dev]` / `[ops]` task tags for the
appropriate domain tags and adjust milestone names accordingly.