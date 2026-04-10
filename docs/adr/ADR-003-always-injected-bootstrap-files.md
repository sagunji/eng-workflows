# ADR-003: Always-injected bootstrap files in downloads

## Status

Accepted

## Context

SkillFlow lets users download partial subsets of the workflow toolkit
(single entities, recipe bundles, or the full zip). Partial downloads
frequently break because entities cross-reference each other — an agent
references skills that weren't downloaded, a command invokes an agent
that isn't present.

Users have no way to detect broken references after installing files
into their project. Failures are silent and late — the model ignores
missing context or routes to the wrong skill.

## Decision

Every zip download (bundle, recipe, full) will always include three
bootstrap files regardless of what the user selected:

1. `.cursor/agents/skillflow-doctor.md` — a read-only agent that scans
   `.claude/` and `.cursor/` for broken references, missing dependencies,
   orphaned entities, and compatibility conflicts.
2. `.claude/commands/skillflow-doctor.md` — a `/skillflow-doctor` command
   that invokes the agent.
3. `INSTALL.md` — setup guide that directs users to run `/skillflow-doctor`
   after installing.

These are **not** added to `graph.json` or the entity explorer. They are
meta-tooling that sits outside the workflow graph — bootstrap files, not
workflow entities.

Single-entity downloads (raw `.md` files, not zips) are unchanged.

## Alternatives considered

1. **Agent-in-graph approach** — add the doctor as a regular graph entity.
   Rejected: adds noise to the explorer (40+ entities), conflates
   meta-tooling with workflow content, and inflates entity counts.

2. **App-side-only solution** — show dependency warnings in the web app,
   no local tooling. Rejected: doesn't help after the user has left the
   site and copied files into their project.

3. **Opt-in checkbox** — "include audit tools" toggle in UI. Rejected
   for v1: adds friction, easy to forget, and the files are tiny.

4. **Separate download button** — "Download audit toolkit" as its own
   action. Rejected: one more concept to discover, fewer users will
   find it.

## Consequences

- Every zip is slightly larger (two small `.md` files + `INSTALL.md`).
- Users get files they didn't explicitly request — the UI should note
  "includes setup tools" to set expectations.
- The `ALWAYS_BUNDLE` constant in the API layer is the single source of
  truth for what gets injected — easy to extend or remove later.
- If this pattern proves unwanted, reverting is trivial: delete the
  constant and the three source files.
- Naming uses `skillflow-` prefix to avoid collision with existing
  audit/review commands (`security-auditor`, `/architecture`, etc.).
