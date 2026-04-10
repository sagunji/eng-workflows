# Installing SkillFlow workflows

## Quick start

Copy the downloaded directories into your project root:

```bash
# If you downloaded the full bundle:
cp -r claude/  your-project/.claude/
cp -r cursor/  your-project/.cursor/

# If you downloaded a recipe or single bundle:
# Merge the contents into your existing .claude/ and .cursor/ directories.
```

The directories **must** be named `.claude/` and `.cursor/` (with the
leading dot) for Claude and Cursor to detect them.

## Verify your install

After copying files, run the doctor to check for missing dependencies
and conflicts:

```
/skillflow-doctor
```

This scans your `.claude/` and `.cursor/` directories and reports:
- **Broken references** — entities that reference something you haven't installed
- **Conflicts** — entities that overlap with ones you already have
- **Orphaned entities** — files that nothing else references (may be intentional)

If issues are found, run `/skillflow-doctor fix` to attempt automatic
repair of simple problems. Complex issues are flagged for your decision.

## What's included

Every SkillFlow download includes two bootstrap files alongside your
selected entities:

| File | Purpose |
|------|---------|
| `.cursor/agents/skillflow-doctor.md` | Agent that scans for broken references and conflicts |
| `.claude/commands/skillflow-doctor.md` | `/skillflow-doctor` command to invoke the health check |

These are lightweight and read-only by default — they only report, never
modify files unless you explicitly run `/skillflow-doctor fix`.

## Partial downloads

If you downloaded a recipe or individual entity (not the full bundle),
some features may reference agents, skills, or commands you don't have.
This is expected. The `/skillflow-doctor` command will tell you exactly
what's missing and where to find it.

**Common resolution:**
1. Run `/skillflow-doctor` to see what's missing
2. Download the missing entities from SkillFlow
3. Run `/skillflow-doctor` again to confirm everything is connected

## Learn more

- Explorer and downloads: https://skillflow.vercel.app
- Source: https://github.com/sagunji/eng-workflows
