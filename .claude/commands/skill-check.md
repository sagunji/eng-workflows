---
description: >
  Validates a SKILL.md file before committing it to .claude/skills/.
  Checks structure, frontmatter, trigger phrases, instruction quality,
  and overlap with existing skills. Use when adding or editing a skill.
  Say "skill-check" or "validate this skill" to invoke.
---

# Skill check

## Purpose
Catch common skill authoring mistakes before they silently cause
under-triggering, over-triggering, or poor output. Runs against a
SKILL.md file or pasted skill content.

---

## Step 1 — Get the skill content

If invoked with no input:
> "Paste your SKILL.md content or tell me which skill to check
> (e.g. 'check the code-reviewer skill')."

---

## Step 2 — Run validation checks

### Check 1 — Frontmatter structure
Verify:
- `---` delimiters present and correctly placed
- `name` field: kebab-case, no spaces, no capitals, no "claude" or
  "anthropic" prefix
- `description` field: present, under 1024 characters, no XML angle
  brackets (`< >`)
- Folder name matches `name` field

```
🚨 BLOCK — [specific frontmatter error]
✅ PASS — frontmatter valid
```

---

### Check 2 — Description quality
The description is the most important part. Check:

- Does it state **what the skill does**?
- Does it state **when to use it** (trigger conditions)?
- Does it include **specific phrases** a user would actually say?
- Does it include **negative triggers** (what it should NOT do)?
- Is it specific enough to distinguish from similar skills?

Rate each:
```
⚠️ FLAG — description missing trigger phrases
⚠️ FLAG — description too vague: "[quote the vague part]"
⚠️ FLAG — no negative triggers — may conflict with [skill name]
✅ PASS — description covers what, when, and exclusions
```

---

### Check 3 — Trigger overlap with existing skills
Compare trigger phrases against the eight existing skills:

```
project-planner  — plan, roadmap, milestones, scope, sprint
code-reviewer    — review, check my code, PR, diff
debug-detective  — broken, error, crash, stack trace, not working
test-writer      — write tests, test coverage, unit tests
doc-writer       — README, docstring, document this, changelog
deploy-checklist — deploy, ship, release, pre-release
pr-describer     — PR description, pull request, write a PR
adr-writer       — ADR, architecture decision, why did we
```

Flag any new skill whose triggers overlap significantly with an
existing one without clear negative trigger boundaries.

```
⚠️ FLAG — trigger overlap with [skill]: "[overlapping phrase]"
           Suggest adding: "Does NOT trigger for X — use [skill] for that."
✅ PASS — no significant trigger overlap detected
```

---

### Check 4 — Instruction quality
Review the SKILL.md body for:

- **Specificity** — are steps concrete and actionable, or vague?
  (`"validate the input"` → vague, `"check that email matches /^[^@]+@[^@]+\.[^@]+$/"` → specific)
- **Examples** — at least one example with user input and expected actions
- **Troubleshooting** — at least one failure case handled
- **Output format** — is the expected output format defined?
- **Length** — under 5000 words (flag if approaching, block if over)

```
⚠️ FLAG — no examples section
⚠️ FLAG — no troubleshooting section
⚠️ FLAG — output format not specified
⚠️ FLAG — [N] words — approaching context limit, move details to references/
✅ PASS — instruction quality looks good
```

---

### Check 5 — Progressive disclosure
Check that the three levels are used correctly:
- **Frontmatter** — only name, description, and metadata (no instructions)
- **SKILL.md body** — core instructions only, not exhaustive reference material
- **references/** — anything that's detailed documentation, examples, or
  reference tables that don't need to be loaded every time

```
⚠️ FLAG — SKILL.md body contains extensive reference material that
           should move to references/ [describe what]
✅ PASS — content is appropriately distributed
```

---

## Step 3 — Output

```
## Skill check — [skill name]

Check 1 — Frontmatter        [✅ / 🚨]
Check 2 — Description        [✅ / ⚠️]
Check 3 — Trigger overlap    [✅ / ⚠️]
Check 4 — Instruction quality [✅ / ⚠️]
Check 5 — Progressive disclosure [✅ / ⚠️]

---
[READY TO COMMIT / REVIEW FLAGS / BLOCK — DO NOT COMMIT]

[Specific items to fix, if any]
```

---

## Follow-up behaviour

- "fix [issue]" → rewrite the flagged section and show the corrected version
- "rewrite description" → generate an improved description based on the
  skill's body content
- "check triggers" → run a deeper trigger phrase analysis and suggest
  additional phrases the current description might be missing