# SkillFlow — Project Plan

> **Assumptions:** Solo developer, 2-week sprints, no existing codebase, local
> PostgreSQL instance available. No external designer — Tailwind + shadcn/ui
> for styling. All 12 skills and 6 commands must be exercised during the build.

---

## Project Brief

SkillFlow is an interactive developer workflow dashboard built with Next.js,
Prisma, and PostgreSQL. It visualises 12 AI-assisted development skills as
nodes in a draggable graph and lets users compose them into reusable workflow
chains. The app serves a dual purpose: it is both a useful reference tool for
understanding skill interactions and a deliberate exercise of every custom
skill and command in the `.claude/` toolkit. Success means a deployed,
functional app where every skill and command was triggered at least once during
development.

---

## Goals (SMART)

1. **Interactive skill graph** — Display all 12 skills as draggable React Flow
   nodes with animated directional edges by end of Sprint 1.
2. **Workflow builder** — Let authenticated users create, save, and load custom
   workflow chains (CRUD) by end of Sprint 2.
3. **Full skill coverage** — Exercise all 12 skills and 6 commands during the
   build process, with each producing its expected artefact, by end of Sprint 3.
4. **Test coverage** — Achieve passing Vitest suites for API routes and key
   React components by end of Sprint 2.
5. **Production-ready** — Pass a deploy checklist and council review with
   GO verdict by end of Sprint 3.

---

## Milestones

| # | Milestone | Description | Exit Criterion | Duration |
|---|-----------|-------------|----------------|----------|
| M1 | Foundation | Project scaffolded, DB schema created, auth working, skills API built | Can log in, call GET /api/skills, see seeded data | Sprint 1 (2 weeks) |
| M2 | Core Features | Interactive graph renders, workflow builder works, tests pass | Can drag nodes, save a workflow, all tests green | Sprint 2 (2 weeks) |
| M3 | Polish & Ship | Docs written, reviewed, profiled, deploy-ready | README complete, council-review GO, deploy checklist CLEAR | Sprint 3 (1 week) |

---

## Sprint Breakdown

| Sprint | Goal | Key Deliverables | Dependencies |
|--------|------|------------------|--------------|
| 1 | Foundation | Scaffolded app, Prisma schema + migration, NextAuth auth, skills CRUD API, seed data | Local PostgreSQL running |
| 2 | Core Features | React Flow graph, workflow builder, Vitest test suites, refactored components | Sprint 1 API + auth |
| 3 | Polish & Ship | README, API docs, PR descriptions, deploy checklist, retro, skill validation | Sprint 2 features complete |

---

## Task List — Milestone 1 (Foundation)

| # | Task | Type | Size | Blocker |
|---|------|------|------|---------|
| 1 | Write ADR for Next.js + Prisma + PostgreSQL decision | `[research]` | S | — |
| 2 | Scaffold Next.js app with TypeScript, Tailwind, App Router | `[dev]` | S | — |
| 3 | Install and configure Prisma with PostgreSQL | `[ops]` | S | #2 |
| 4 | Design Prisma schema (User, Skill, SkillEdge, Workflow, WorkflowStep) | `[dev]` | M | #3 |
| 5 | Run db-schema-reviewer on schema.prisma | `[review]` | S | #4 |
| 6 | Generate and apply initial migration | `[ops]` | S | #5 |
| 7 | Implement NextAuth.js with credentials provider | `[dev]` | L | #3 |
| 8 | Run security-auditor on auth routes | `[review]` | S | #7 |
| 9 | Build skills CRUD API (GET/POST /api/skills, GET /api/skills/[id]) | `[dev]` | L | #6 |
| 10 | Build skill edges API (GET /api/skills/[id]/edges) | `[dev]` | M | #9 |
| 11 | Create seed script with all 12 skills and their edges | `[dev]` | M | #6 |
| 12 | Build skills list page and skill detail component | `[dev]` | L | #9 |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| PostgreSQL not available locally | Low | High | Fall back to SQLite for dev; Prisma supports both |
| React Flow learning curve slows Sprint 2 | Medium | Medium | Use official examples as starting templates; timebox to 1 day |
| council-implement subagents produce conflicting code | Medium | Medium | Review and consolidate manually; keep FE/BE boundaries clear |
| Skill triggers overlap causing wrong skill to fire | Low | Low | Use skill-check to validate; apply skill-override if needed |
| Scope creep from polishing the UI | Medium | Medium | Sprint 3 is capped at 1 week; only cosmetic fixes, no new features |

---

> Want me to generate tasks for the remaining milestones, export this as a
> Notion-ready doc, or refine any section?
