---
description: >
  Post-install health check for SkillFlow workflows. Finds broken
  references, missing dependencies, orphaned entities, and conflicts.
  Run after installing new workflow files, or when something feels
  broken. Say "/skillflow-doctor" or "check my setup".
---

# SkillFlow doctor

Run a full health check on your `.claude/` and `.cursor/` setup.
Finds broken references, missing dependencies, dead commands, orphaned
entities, and compatibility conflicts. Can auto-fix simple issues.

Run this after installing anything new. Run this when something feels broken.
Run this before a major project to make sure the whole system is healthy.

---

## Usage

```
/skillflow-doctor                      ← full health check, report only
/skillflow-doctor fix                  ← check + attempt auto-repair
/skillflow-doctor [filename]           ← check a single file only
/skillflow-doctor --pre-install [file] ← check a file before installing it
/skillflow-doctor --check-existing     ← compatibility check against existing setup only
```

---

## What gets checked

```
.claude/commands/     all command .md files
.claude/skills/       all SKILL.md files and their scripts/
.cursor/agents/       all agent .md files
.cursor/rules/        all .mdc rule files
```

---

## Step 1 — Invoke skillflow-doctor agent

Delegate to the `skillflow-doctor` agent with the appropriate mode:

- No flags → full check mode
- `fix` → full check + fix mode
- `[filename]` → single file check mode
- `--pre-install [file]` → pre-install check mode
- `--check-existing` → compatibility check only

Pass the full filesystem context so the doctor can build an accurate
inventory before checking references.

---

## Step 2 — Present results

Present the health report from `skillflow-doctor` directly. Do not
summarise or truncate — the full report with all broken references,
orphaned entities, and recommendations.

---

## Step 3 — Fix mode

If `/skillflow-doctor fix` was run:

1. Show what will be auto-fixed before making any changes
2. Wait for confirmation: "Proceed with auto-fixes? (yes / show me each one)"
3. Apply auto-fixes
4. Re-run check to confirm fixes resolved the issues
5. Present remaining items that require human decision

---

## Step 4 — Pre-install mode

If `--pre-install [file]` was run:

1. Parse the incoming file(s) without writing them
2. Check all their references against current inventory
3. Run compatibility check
4. Present verdict: READY / BLOCKED / CONFLICTS
5. Wait for user decision before any files are written

**Recommended flow for all downloads:**
```
# Before installing anything new:
/skillflow-doctor --pre-install [new-agent.md]

# After installing:
/skillflow-doctor fix
```

---

## Download installation note

This command should be the first thing you run after downloading any
agent, skill, or command from any source. Downloaded files may:

- Reference agents or skills you haven't installed yet
- Conflict with entities you already have
- Assume file paths that don't exist in your project
- Have been written for a different stack or folder structure

A 2-minute check saves hours of debugging why an agent isn't working.

---

## Quick reference

| What you want to do | Command |
|--------------------|---------|
| Check everything is healthy | `/skillflow-doctor` |
| Fix broken references | `/skillflow-doctor fix` |
| Check one file | `/skillflow-doctor council-review.md` |
| Check before installing | `/skillflow-doctor --pre-install new-agent.md` |
| Find conflicts with existing setup | `/skillflow-doctor --check-existing` |
