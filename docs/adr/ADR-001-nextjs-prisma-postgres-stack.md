# ADR-001: Use Next.js App Router + Prisma + PostgreSQL for SkillFlow

**Date:** 2026-04-08
**Status:** Superseded by ADR-002
**Deciders:** Solo developer (project owner)

---

## Context

SkillFlow is a new interactive dashboard that visualises 12 AI development
skills as a draggable node graph and lets users compose them into reusable
workflow chains. The app needs:

- A rich, interactive frontend with drag-and-drop graph editing
- Server-side rendering for initial page loads and SEO
- A relational data model (skills, edges, workflows, users) with foreign keys
- User authentication with session persistence
- An API layer for CRUD operations
- A type-safe ORM for schema management and migrations

The project is built by a solo developer. Speed of iteration, type safety
across the stack, and a single deployment target are high priorities. The
skill/command exercise goal means the stack must be substantial enough to
trigger database, security, and performance skills meaningfully.

---

## Decision

> We will use **Next.js 14 (App Router)** for the full-stack framework,
> **Prisma** as the ORM, and **PostgreSQL** as the primary database.

---

## Options considered

### Option A: Next.js App Router + Prisma + PostgreSQL (chosen)

Full-stack JavaScript with React Server Components, file-based routing, and
built-in API route handlers. Prisma provides type-safe database access with
declarative schema and auto-generated migrations. PostgreSQL handles relational
data with strong integrity guarantees.

**Pros**
- Single language (TypeScript) across frontend, backend, and ORM
- App Router enables Server Components, reducing client bundle size
- Prisma schema is human-readable and generates TypeScript types automatically
- PostgreSQL supports array fields (for skill triggers), robust indexing, and
  is the most exercised DB in the db-schema-reviewer skill
- Single `next build` deployment — no separate API server to manage
- Large ecosystem: NextAuth.js, React Flow, Tailwind all have first-class Next.js support

**Cons**
- App Router is still evolving; some patterns have rough edges
- Prisma adds a query engine binary (~15 MB) to the deployment
- Next.js API routes are less flexible than a dedicated Express/Fastify server
  for complex middleware chains

---

### Option B: React (Vite) + Express + Prisma + PostgreSQL

Separate React SPA frontend and Express REST API backend. Two deployable units
with clear separation of concerns.

**Pros**
- Full control over Express middleware, routing, and error handling
- Frontend and backend can be deployed and scaled independently
- More conventional backend architecture for exercising backend-specific skills

**Cons**
- Two build processes, two deployment targets, two dev servers
- CORS configuration required
- Duplicated TypeScript types unless a shared package is introduced
- Slower iteration cycle for a solo developer
- No server-side rendering without additional SSR setup

---

### Option C: React + FastAPI (Python) + SQLAlchemy + PostgreSQL

React frontend with a Python backend. SQLAlchemy for ORM, Alembic for
migrations.

**Pros**
- Python ecosystem is strong for data processing and ML integrations
- SQLAlchemy is a mature, battle-tested ORM
- Clear language boundary forces well-defined API contracts

**Cons**
- Two languages means context switching and separate toolchains
- No shared types between frontend and backend
- FastAPI + React requires managing two separate deployments
- Python backend adds complexity disproportionate to the app's data needs
- Less relevant to the JavaScript-focused skill set being tested

---

## Rationale

The primary driver was **iteration speed for a solo developer**. Next.js
eliminates the frontend/backend deployment split, and Prisma eliminates the
SQL/TypeScript type mismatch. Together they allow shipping features in a
single codebase with end-to-end type safety.

Option B was the closest runner-up but was rejected because managing two
servers and a CORS layer adds operational overhead without proportional
benefit for this project's scope. The separation of concerns it offers is
valuable for teams, but unnecessary for a solo developer building a
dashboard.

Option C was rejected because introducing Python would split the toolchain
without a compelling reason — SkillFlow has no ML or heavy data processing
requirements.

PostgreSQL was chosen over SQLite because the db-schema-reviewer and
security-auditor skills exercise more meaningfully against a real database
server with connection pooling, indexes, and migration safety concerns.

---

## Consequences

### What becomes easier
- Adding new pages, API routes, and components happens in one codebase
- Prisma schema changes auto-generate typed client and migration SQL
- Deployment is a single `next build` artefact

### What becomes harder
- Complex backend middleware (rate limiting, request queuing) requires
  Next.js middleware or external services rather than Express middleware
- Prisma's query engine is an abstraction — raw SQL may be needed for
  advanced PostgreSQL features (CTEs, window functions)

### Follow-up decisions required
- Choose an authentication library (NextAuth.js — decided, not yet an ADR)
- Choose a graph visualisation library (React Flow — decided, not yet an ADR)
- Decide on deployment target (Vercel, Docker, or self-hosted)

---

## References

- [Next.js App Router documentation](https://nextjs.org/docs/app)
- [Prisma documentation](https://www.prisma.io/docs)
- [PostgreSQL documentation](https://www.postgresql.org/docs/)
- SkillFlow project plan: `docs/project-plan.md`
