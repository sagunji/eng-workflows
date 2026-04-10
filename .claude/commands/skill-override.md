---
description: >
  Writes a persistent rule or preference into a skill's SKILL.md.
  Overrides are appended to a dated change log section. Use when you
  say "/skill-override", "override this skill", or "add a rule to
  this skill".
---

# Skill override

Write a persistent rule or preference into a specific skill's SKILL.md.
Overrides are appended to a dated change log section — never silently
mutate existing instructions. Every override is traceable and reversible.

---

## Usage

```
/skill-override <skill-name> "<rule>"
/skill-override <skill-name> "<rule>" --reason "<why>"
/skill-override <skill-name> revert <override-id>
/skill-override <skill-name> list
```

Examples:
```
/skill-override code-reviewer "always prefer const over let in JS suggestions"
/skill-override test-writer "we use Vitest, never Jest" --reason "monorepo standard"
/skill-override project-planner "default sprint length is 1 week not 2"
/skill-override deploy-checklist "skip the feature flag section, we don't use flags"
/skill-override code-reviewer revert OVR-003
/skill-override test-writer list
```

---

## Step 1 — Validate the request

Before writing anything:

1. **Skill exists** — confirm `.claude/skills/<skill-name>/SKILL.md` exists.
   If not, list available skills and ask the user to confirm the name.

2. **Rule is specific** — vague rules produce inconsistent behaviour.
   Flag and ask for clarification if the rule is ambiguous:
   - Too vague: `"be more concise"` → ask: "More concise in which section?
     Summary, findings, or everywhere?"
   - Specific enough: `"keep the Summary section to 2 sentences maximum"`

3. **Rule doesn't conflict** — check if an existing override already
   covers the same behaviour. If so, ask: "Override OVR-002 already sets
   [X]. Do you want to replace it or add alongside it?"

4. **Rule scope is clear** — does this apply always, or only in certain
   conditions? If conditional, prompt the user to make it explicit:
   - `"use tabs"` → applies always
   - `"use tabs for Python files"` → applies conditionally — write it that way

---

## Step 2 — Assign an override ID

Each override gets a unique ID: `OVR-NNN` where NNN is the next sequential
number in this skill's override log. If no overrides exist yet, start at
`OVR-001`.

Read the existing `## Overrides` section to find the last ID, or start
fresh if the section doesn't exist.

---

## Step 3 — Write the override

Append to the SKILL.md file. If an `## Overrides` section already exists,
add to it. If not, append it after the last section in the file.

### Format to append:

```markdown
## Overrides

<!-- Override log — do not edit manually. Use /skill-override to add,
     revert, or list overrides. -->

| ID | Date | Rule | Reason | Status |
|----|------|------|--------|--------|
| OVR-001 | YYYY-MM-DD | [rule as written by user] | [reason or "—"] | Active |
```

For subsequent overrides, add a new row to the table.

### Also inject the rule into the relevant section body:

After appending the log entry, inject the rule as an explicit instruction
into the most relevant section of the SKILL.md body. Place it under a
`### Overrides` subsection within that section, or at the top of the
instructions if it applies globally:

```markdown
### Overrides
> OVR-001 (YYYY-MM-DD): [rule verbatim]
```

The `>` blockquote visually distinguishes overrides from original
instructions. The ID makes them traceable back to the log.

---

## Step 4 — Confirm to the user

After writing:

```
## Override written — <skill-name>

ID: OVR-NNN
Rule: "[rule as written]"
Reason: [reason or "none given"]
Applied to: [section(s) of the SKILL.md where the rule was injected]
Effective: immediately — applies to all future conversations

To revert: /skill-override <skill-name> revert OVR-NNN
To see all overrides: /skill-override <skill-name> list
```

---

## Revert behaviour

When the user runs `/skill-override <skill-name> revert <OVR-ID>`:

1. Find the override row in the log table and change its Status to
   `Reverted (YYYY-MM-DD)`
2. Find and remove the injected `> OVR-NNN` blockquote from the
   SKILL.md body
3. Confirm:

```
## Override reverted — <skill-name>

OVR-NNN has been reverted.
Rule "[rule]" is no longer active.
The override remains in the log for audit purposes.
```

Never delete log entries — reverted overrides stay in the table with
their status updated. The log is append-only.

---

## List behaviour

When the user runs `/skill-override <skill-name> list`:

```
## Overrides — <skill-name>

| ID | Date | Rule | Status |
|----|------|------|--------|
| OVR-001 | 2025-01-15 | always prefer const over let | Active |
| OVR-002 | 2025-01-20 | keep Summary to 2 sentences | Active |
| OVR-003 | 2025-01-22 | use tabs not spaces | Reverted (2025-01-23) |

3 overrides total — 2 active, 1 reverted.
```

---

## Override precedence rules

When an override conflicts with an original instruction in the SKILL.md:

- **Override wins** — it is always more specific and more recent than
  the original instruction
- Document the conflict in the injected blockquote:
  ```
  > OVR-002 (2025-01-20): keep Summary to 2 sentences maximum
  > (overrides original instruction: "2–3 sentence overview")
  ```

When two active overrides conflict with each other:

- **Later override wins** — higher OVR number takes precedence
- Warn the user at write time: "This conflicts with OVR-001 which sets
  [X]. OVR-002 will take precedence. Do you want to revert OVR-001?"

---

## What overrides are good for

```
Skill preference:      /skill-override test-writer "use Vitest not Jest"
Style rule:            /skill-override code-reviewer "prefer early returns over nested if"
Team convention:       /skill-override doc-writer "use Google-style docstrings"
Scope reduction:       /skill-override deploy-checklist "skip feature flags section"
Default change:        /skill-override project-planner "default sprint = 1 week"
Stack-specific:        /skill-override perf-profiler "we use Prisma, not raw SQL"
Severity adjustment:   /skill-override security-auditor "treat missing rate limiting as Major not Minor"
```

## What overrides are NOT for

- Changing a skill's core purpose — if you need fundamentally different
  behaviour, build a new skill
- Temporary session-only changes — just tell Claude in the conversation;
  don't write it to the skill
- Fixing a bug in a skill's logic — edit the SKILL.md directly and
  commit it; don't use an override for structural fixes
- Overriding a stop condition in deploy-checklist or security-auditor —
  those exist for safety reasons; removing them defeats the purpose

---

## Examples

### Example 1 — Simple preference
```
/skill-override test-writer "we use Vitest not Jest"
```
Injects into the "Detect the environment" section of test-writer/SKILL.md:
```
### Overrides
> OVR-001 (2025-01-15): we use Vitest not Jest
> (overrides default framework detection: Jest for JS/TS)
```

### Example 2 — Override with reason
```
/skill-override project-planner "default sprint length is 1 week" --reason "we do weekly releases"
```
Logged with reason. Future plans default to 1-week sprints without asking.

### Example 3 — Conflicting override caught
```
/skill-override code-reviewer "always suggest let not const"
```
System detects OVR-001 set the opposite. Warns before writing and asks
for confirmation.

### Example 4 — Revert after testing
```
/skill-override project-planner revert OVR-002
```
The 1-week sprint override is reverted. The log entry remains with
`Reverted (2025-01-22)`. Default sprint length returns to 2 weeks.