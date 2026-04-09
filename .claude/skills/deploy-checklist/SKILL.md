---
name: deploy-checklist
description: >
  Generates a pre-deployment checklist tailored to the stack and environment.
  Covers env vars, migrations, feature flags, rollback plan, monitoring, and
  smoke tests. Use when user says "I'm about to deploy", "pre-release checklist",
  "ready to ship", "deploying to production", "release checklist", "what do I
  need to check before I deploy", or describes an imminent release.
  Does NOT trigger for general deployment advice, CI/CD setup questions,
  or post-deployment debugging.
license: MIT
metadata:
  author: sagun karanjit
  version: 1.0.0
  category: deployment
---

# Deploy checklist

## Purpose
Generate a deployment checklist that is specific to the stack, environment,
and change being deployed — not a generic list that gets ignored.
Every item must be actionable and verifiable. No filler.

---

## Step 1 — Gather context

Before generating the checklist, determine:

1. **What is changing** — new feature, bug fix, migration, config change,
   dependency update, or infrastructure change?
2. **Target environment** — staging, production, multi-region?
3. **Stack signals** — infer from any code, config, or description shared:
   - Runtime: Node, Python, Go, Java, etc.
   - Database: Postgres, MySQL, MongoDB, etc.
   - Infrastructure: Docker, Kubernetes, serverless, bare metal
   - CI/CD: GitHub Actions, CircleCI, Jenkins, etc.
4. **Team size and process** — solo deploy or coordinated release?

If none of this is provided, ask once:
> "What are you deploying and what's your stack? (e.g. Node + Postgres on
> Kubernetes, or a Django app on Heroku)"

Use whatever is provided. Make reasonable assumptions for anything missing
and state them at the top of the checklist.

---

## Step 2 — Generate the checklist

Produce a checklist of gates organised into six phases. Each item is either:
- ✅ **Verify** — check that something is true
- 🔧 **Action** — do something before proceeding
- 🚨 **Stop condition** — if this fails, do not proceed

Tailor items to the actual stack and change. Omit phases or items that
genuinely don't apply — a static site deploy needs no database section.

---

### Phase 1 — Code and build

```
[ ] All tests passing on CI (unit, integration, e2e if applicable)
[ ] No failing lint or type checks
[ ] Build artifact produced and tagged with version or commit SHA
[ ] Dependency audit clean (no critical CVEs introduced)
[ ] No debug flags, test credentials, or console.log/print statements in
    production code paths
[ ] Feature branch merged to main / release branch — no stale divergence
```

Stop condition:
```
🚨 Any failing test or broken build → do not proceed
```

---

### Phase 2 — Configuration and secrets

```
[ ] All required environment variables set in target environment
[ ] No new env vars added to code without being provisioned in production
[ ] Secrets rotated if any were exposed or are expiring within 30 days
[ ] Third-party API keys have correct production values (not sandbox/test)
[ ] Config diff reviewed — no unexpected changes from last deploy
```

Stack-specific additions:
- **Docker/K8s:** ConfigMaps and Secrets updated before rollout
- **Serverless:** Function environment variables updated in console/IaC
- **Multi-region:** Config propagated to all regions before cutover

Stop condition:
```
🚨 Any required env var missing in production → do not proceed
```

---

### Phase 3 — Database and migrations

*Skip entirely if no database changes in this release.*

```
[ ] Migration scripts reviewed — no destructive changes without a plan
[ ] Migration tested against a production-sized data snapshot
[ ] Migration is reversible — down migration written and tested
[ ] No column or table renames that break the current running version
    (if zero-downtime deploy: add column first, migrate data, remove old
    column in a separate release)
[ ] Long-running migration assessed for lock risk — scheduled for low-traffic
    window if locks are expected
[ ] Backup taken immediately before migration runs
```

Stop condition:
```
🚨 Irreversible migration with no backup → do not proceed
🚨 Migration untested against production schema → do not proceed
```

---

### Phase 4 — Feature flags and rollout

*Skip if no feature flags are in use.*

```
[ ] New features gated behind flags — off by default in production
[ ] Flag state documented: which flags are on, for whom, since when
[ ] Gradual rollout configured if applicable (canary, % rollout)
[ ] Kill switch tested — can the flag be disabled in under 2 minutes?
[ ] Flags from previous releases cleaned up if fully rolled out
```

---

### Phase 5 — Rollback plan

Every deploy must have a documented rollback plan before it starts.

```
[ ] Previous stable version identified (tag, SHA, or artifact name)
[ ] Rollback steps written and accessible to everyone on call:
    1. How to revert the deployment (kubectl rollout undo / git revert /
       redeploy previous artifact)
    2. How to reverse the migration if one ran
    3. How to revert config or secret changes
[ ] Rollback time estimated — if > 15 minutes, escalation path defined
[ ] On-call engineer notified and available for the deploy window
```

Stop condition:
```
🚨 No rollback plan documented → do not proceed
```

---

### Phase 6 — Post-deploy verification

```
[ ] Smoke tests run against production immediately after deploy:
    - Health check endpoint returns 200
    - Critical user path works end-to-end (login, core action, key API call)
[ ] Error rate in monitoring — baseline established before deploy,
    check for spike in first 10 minutes
[ ] Latency P50/P95 within normal range
[ ] No spike in 5xx responses
[ ] Logs showing expected startup behaviour — no unexpected warnings or errors
[ ] Feature flag turned on (if applicable) only after smoke tests pass
```

Stop condition:
```
🚨 Error rate > baseline after 10 minutes → initiate rollback
🚨 Critical path smoke test failing → initiate rollback
```

---

## Step 3 — Tailor for stack

After the base checklist, add a stack-specific section if relevant signals
were detected.

### Node / frontend
```
[ ] Bundle size within acceptable range — no accidental large dependency added
[ ] Source maps generated and uploaded to error tracker (Sentry, etc.)
[ ] Cache headers correct for new asset filenames (if cache-busting by hash)
[ ] CDN cache invalidated for changed assets
```

### Python / Django / Flask
```
[ ] `collectstatic` run if static files changed
[ ] Celery workers restarted if task signatures changed
[ ] Django migrations applied before web workers restart
```

### Containerised (Docker / Kubernetes)
```
[ ] Image tagged with immutable version (not `latest`)
[ ] Resource limits (CPU/memory) set on new pods
[ ] Liveness and readiness probes configured
[ ] PodDisruptionBudget in place for zero-downtime rolling update
[ ] Helm chart diff reviewed if using Helm
```

### Serverless
```
[ ] Cold start time acceptable for the use case
[ ] Timeout and memory limits appropriate for new code paths
[ ] Concurrent execution limits assessed
[ ] Dead letter queue configured for async functions
```

---

## Step 4 — Output format

Present the checklist as a copyable Markdown document the user can paste
into their PR, Notion, Linear, or runbook. Include:

- Title with date and version/SHA
- Assumptions made (if any context was inferred)
- All six phases with checkboxes
- Stack-specific section if applicable
- A single "deploy decision" line at the bottom:

```
---
Deploy decision: [ ] GO  [ ] NO-GO
Signed off by: _______________  Date: ___________
```

---

## Examples

### Example 1 — Minimal context
**User:** "I'm about to deploy to production"

**Actions:**
1. Ask for stack and what's changing
2. Generate full checklist with assumptions noted
3. Flag that database and migration sections should be confirmed

### Example 2 — Rich context
**User:** "Deploying a Node/Postgres app on K8s — includes a DB migration
that adds a non-nullable column"

**Actions:**
1. Full checklist generated
2. Phase 3 (migrations) expanded — non-nullable column without default is
   high risk, flag explicitly
3. K8s-specific items added
4. Stop condition highlighted: test migration on prod-sized snapshot first

### Example 3 — Post-incident
**User:** "We just had a bad deploy, help me build a checklist going forward"

**Actions:**
1. Generate standard checklist
2. Add a Phase 0 — Incident review: "What failed last time? Is that item
   explicitly covered in this checklist?"
3. Suggest adding the checklist to the repo as a required PR template step

---

## Troubleshooting

**User wants to skip items to move faster:**
Acknowledge the pressure. Distinguish clearly between items that are
optional (feature flags, gradual rollout) and stop conditions that protect
data integrity and availability. Never soft-pedal a stop condition.

**Solo developer, no on-call:**
Simplify the rollback and sign-off sections. The core gates still apply —
a solo developer still needs a rollback plan, they just don't need to
notify a team.

**Deploying infrastructure changes (not code):**
Replace Phase 1 (code/build) with an infrastructure diff review.
Phases 2, 5, and 6 still apply. Add: "IaC plan reviewed and approved
before apply."