# PR Description — SkillFlow: Full Application Build

## feat: Build SkillFlow interactive developer workflow dashboard

### What changed

Full-stack Next.js application that visualises 12 AI development skills as
an interactive node graph with workflow composition.

**Backend:**
- Prisma schema with 5 models (User, Skill, SkillEdge, Workflow, WorkflowStep)
- NextAuth.js authentication with JWT sessions and bcrypt password hashing
- REST API: skills (public read), workflows (authenticated CRUD)
- Zod validation on all input endpoints
- Idempotent seed script for 12 skills and 14 skill-to-skill edges

**Frontend:**
- Landing page with sign-in/register flow
- Dashboard with three views: skill cards grid, interactive React Flow graph,
  workflow list
- Custom React Flow nodes with category-coloured borders
- Slide-in detail panel showing skill description, triggers, and connections
- Workflow editor with drag-and-drop skill ordering and auto-save
- Responsive dark theme throughout using Tailwind CSS

**Testing and quality:**
- 24 Vitest tests across 4 test files (utilities, hooks, components)
- TypeScript strict mode with zero errors
- Code review, security audit, schema review, and performance profile documented

### Why

This project serves as a comprehensive exercise of all 12 `.claude/skills/`
and 6 `.claude/commands/`, demonstrating their interaction patterns. Each
skill was triggered naturally during the build process.

### How to test

1. `npm install && npx prisma generate`
2. Start PostgreSQL and run `npx prisma migrate dev`
3. Seed data: `npx tsx --tsconfig tsconfig.json prisma/seed.ts`
4. `npm run dev` — open http://localhost:3000
5. Register an account, explore skills grid, switch to graph view
6. Create a workflow and drag skills into it
7. Run `npx vitest run` to verify tests pass

### Risks

- Prisma 7 constructor requires `{} as never` workaround — may need update
  when Prisma stabilises adapter API
- React Flow is a large client dependency (~200KB) — acceptable for a
  dashboard app but consider lazy loading for production

### Checklist

- [x] TypeScript compiles with zero errors
- [x] 24 tests passing
- [x] README with setup instructions
- [x] API documentation
- [x] ADR for tech stack decision
- [x] Security audit completed
- [x] No secrets in source code
