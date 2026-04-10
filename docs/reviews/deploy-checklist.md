# Deploy Checklist — SkillFlow (Next.js + Prisma + PostgreSQL)

## Phase 1: Code and Build

- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npx vitest run` — all 24 tests green
- [ ] `next build` completes without errors
- [ ] No `.env` or secrets in the repository
- [ ] `.gitignore` includes: `.env`, `node_modules/`, `.next/`, `src/generated/`

## Phase 2: Configuration and Secrets

- [ ] `DATABASE_URL` set in production environment (not the dev default)
- [ ] `NEXTAUTH_SECRET` generated with `openssl rand -base64 32` (NOT the dev default)
- [ ] `NEXTAUTH_URL` set to the production domain
- [ ] Verify `NEXTAUTH_SECRET !== "dev-secret-change-in-production"`
- [ ] Database connection uses SSL in production (`?sslmode=require`)

## Phase 3: Database and Migrations

- [ ] PostgreSQL instance provisioned and accessible from deploy target
- [ ] `npx prisma migrate deploy` runs successfully against production DB
- [ ] Seed script run if this is the first deployment:
      `npx tsx --tsconfig tsconfig.json prisma/seed.ts`
- [ ] Verify migrations are idempotent (can re-run safely)
- [ ] Database backups configured

## Phase 4: Feature Flags and Rollback

- [ ] Previous working deployment tagged/bookmarked for rollback
- [ ] Rollback plan: revert to previous deployment + `prisma migrate resolve`
- [ ] No destructive migrations in this release (no `DROP TABLE`, `DROP COLUMN`)

## Phase 5: Post-Deploy Verification

- [ ] Hit `/api/skills` — returns 12 skills with edges
- [ ] Register a new account — succeeds
- [ ] Sign in — redirects to `/dashboard`
- [ ] Graph view loads at `/dashboard/graph` — 12 nodes visible
- [ ] Create and save a workflow — persists after page refresh
- [ ] Sign out — redirects to sign-in page
- [ ] Unauthenticated access to `/api/workflows` returns 401
- [ ] Check application logs for unexpected errors

## Phase 6: Monitoring

- [ ] Error tracking configured (Sentry, LogRocket, or equivalent)
- [ ] Application health endpoint or uptime check configured
- [ ] Database connection pool monitoring in place
- [ ] Alert on error rate spike within first hour after deploy

---

## GO / NO-GO

- [ ] All Phase 1-5 checks passed
- [ ] Phase 6 monitoring in place or scheduled within 24 hours

**Decision:** ___________
