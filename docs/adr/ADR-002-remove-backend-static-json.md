# ADR-002: Remove Backend — Static JSON + Filesystem Reads

**Date:** 2026-04-09
**Status:** Accepted
**Deciders:** Solo developer (project owner)
**Supersedes:** ADR-001 (Next.js + Prisma + PostgreSQL stack)

---

## Context

ADR-001 chose Next.js + Prisma + PostgreSQL as the SkillFlow stack. After
building the app, several problems became clear:

1. **Data is inherently static.** Skills, agents, and commands are defined in
   `.md` files under `.claude/skills/`, `.cursor/agents/`, and
   `.claude/commands/`. The database merely duplicated what was already on
   the filesystem.
2. **The seed script re-declared every entity.** Names, descriptions,
   triggers, categories, and roles were hardcoded in `prisma/seed.ts` —
   a second source of truth that drifted from the `.md` frontmatter.
3. **PostgreSQL is an operational burden.** Running a database server for a
   local visualization tool adds setup steps, environment variables, and
   failure modes that provide no value.
4. **Authentication serves no purpose.** There is no user-specific data worth
   protecting. The workflow feature was scaffolded but never completed.
5. **The content API already reads from disk.** The most useful endpoint
   (`/api/entities/[type]/[name]/content`) bypasses the database entirely
   and reads `.md` files with `fs.readFile`.

---

## Decision

> Remove PostgreSQL, Prisma, and NextAuth entirely. Serve entity and
> relationship data from a static `public/graph.json` file. Keep the
> filesystem-based markdown content API route as the only server endpoint.

---

## Options considered

### Option A: Static JSON + filesystem reads (chosen)

Replace the database with a `graph.json` file containing all entities and
edges. Keep a single Next.js API route for reading `.md` content from disk
at request time.

**Pros**
- Zero infrastructure: no database, no migrations, no seed script
- Single source of truth: `.md` files for content, one JSON for relationships
- Works instantly after `npm install && npm run dev`
- Deployment is trivial (any Node host, or static export later)

**Cons**
- Adding a new entity requires editing `graph.json` (not auto-discovered)
- No user accounts, no persisted workflows
- Relationship data is manually maintained

### Option B: Keep current stack (PostgreSQL + Prisma + NextAuth)

Status quo.

**Pros**
- Supports future user features (workflows, saved preferences)
- Structured data with FK constraints and migrations

**Cons**
- Requires running PostgreSQL locally
- Data is duplicated between seed script and filesystem
- Auth adds complexity with no current use case
- Onboarding requires database setup, env vars, migrations, seeding

### Option C: Full static site generation (SSG)

Export everything at build time, including markdown content. No API routes
at all.

**Pros**
- Deployable to any static host (GitHub Pages, S3)
- No Node runtime needed in production

**Cons**
- Editing a `.md` file requires a rebuild to see changes
- Breaks the live development workflow
- More complex build pipeline

---

## Rationale

Option A was chosen because the app is a local development tool, not a
multi-user service. The database was solving a problem that didn't exist —
there is no runtime mutation of entity data. The only dynamic read (markdown
content) is already served from the filesystem.

Option C was rejected because the development workflow matters more than
deployment simplicity for this tool. Being able to edit a skill's `.md` file
and see the change on page refresh is valuable during active development.

---

## Consequences

### What becomes easier
- Onboarding: `npm install && npm run dev` — no database required
- Adding entities: create the `.md` file, add an entry to `graph.json`
- Deployment: no database provisioning or connection strings
- Understanding the codebase: fewer moving parts, no ORM layer

### What becomes harder
- User-specific features (workflows, preferences) would need to be
  reimplemented with localStorage or a future backend
- Relationship data must be maintained manually in `graph.json`

### Follow-up decisions required
- Consider auto-generating `graph.json` from frontmatter in a future ADR
- Consider SSG export if the tool is ever published publicly

---

## References

- ADR-001: Use Next.js App Router + Prisma + PostgreSQL for SkillFlow
- Council review of this decision (conversation record)
