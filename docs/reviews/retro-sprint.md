# Retro — Sprint (Full Build) — 2026-04-08

## Summary

SkillFlow was built across 3 sprints exercising all 12 skills and 6 commands.
The foundational work (Sprint 1) went smoothly. Sprint 2 required debugging
Prisma 7 breaking changes. The build achieved its primary goal: every skill
and command produced a concrete artefact.

---

## What worked

- **Parallel agent dispatch** — Using `council-implement` with FE and BE
  agents simultaneously cut Sprint 1.6 implementation time roughly in half.
  The agents produced consistent code with minimal conflicts.

- **Shared utility extraction** — The code-reviewer finding about duplicated
  `CATEGORY_BADGE_STYLES` was caught early and consolidated into
  `category-styles.ts`. This prevented four future files from drifting.

- **Security-first auth implementation** — Running security-auditor
  immediately after building auth caught the account enumeration issue
  before any other code depended on the 409 status code.

- **Test-driven refactor** — The refactor-guide plan required tests before
  extracting `graph-layout.ts`. Having tests first made the extraction
  mechanical and verifiable.

## What didn't work

- **Prisma 7 constructor breaking change** — The `new PrismaClient()` zero-arg
  constructor worked in Prisma 6 but fails in Prisma 7 which requires an
  `adapter` or `accelerateUrl`. Root cause: `create-next-app` installed the
  latest Prisma which was v7, but tutorials and skills assume v6 patterns.
  The `{} as never` workaround is fragile.

- **Duplicated data fetching** — Both the cards page and graph page
  independently implemented the same fetch-and-parse logic for skills.
  Root cause: parallel development without a pre-agreed hook.
  Fix was applied (extracted `useSkills` hook) but ideally hooks should
  be designed before page components.

## Surprises

- **Prisma 7 was the default** — Expected Prisma 5 or 6 from npm. The new
  generated client output path (`src/generated/prisma`) and constructor
  API caught us off guard.

- **React Flow v12 API** — The `@xyflow/react` package name and import
  structure differ from older `reactflow` tutorials. Adapting was
  straightforward but required reading current docs rather than relying
  on examples.

- **24 tests from 4 files** — The test-writer skill produced higher
  coverage than expected from the targeted files. The pure utility
  extraction (graph-layout) made unit testing trivial.

---

## Action items

| Action | Owner | Due | Linked to |
|--------|-------|-----|-----------|
| Replace `{} as never` Prisma cast when adapter API stabilises | Dev | Next sprint | Prisma 7 breaking change |
| Add workflow API and auth integration tests | Dev | Next sprint | QA coverage gap |
| Create shared hooks before building parallel page components | Dev | Next project | Duplicated fetch logic |
| Update deploy-checklist skill with Prisma 7 migration notes | Dev | Next sprint | Prisma 7 surprise |

---

## Skill gap report

### Skills that helped
- **project-planner** — Structured the entire 3-sprint roadmap upfront
- **security-auditor** — Caught account enumeration before it propagated
- **code-reviewer** — Identified the duplicated utility extraction opportunity
- **test-writer** — Generated high-value edge-case tests automatically
- **refactor-guide** — Sequenced the graph extraction safely
- **db-schema-reviewer** — Caught redundant indexes before migration

### Skills that were missing
- No skill for **dependency version management** — the Prisma 7 surprise
  could have been caught by a skill that checks major version bumps during
  scaffolding. Suggested skill: `dep-checker` — validates that installed
  major versions match the skill/command knowledge base.

### Skills that triggered incorrectly
- None — all 12 skills triggered at the correct moments for their intended use.

### Commands that would have helped
- A `/scaffold` command that wraps `create-next-app` + dependency installation
  + Prisma init + standard file structure would have saved the manual
  setup time and caught the Prisma version issue earlier.
