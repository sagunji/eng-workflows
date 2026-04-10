# Schema Review — prisma/schema.prisma

## Summary

Well-structured Prisma schema with five models covering users, skills, skill
relationships, workflows, and workflow steps. FK indexes are present on all
relation columns, unique constraints cover identity fields and composite keys,
and cascade deletes are explicit. Two minor issues and one major issue to
address before the initial migration.

---

## Findings

### 🟡 Major — should fix before deploying

- **Nullable and default traps** — `User.name` is nullable (`String?`) but
  there is no indication whether the application handles NULL names gracefully
  in display contexts. If the UI will always show a name, consider defaulting
  to an empty string instead of NULL.
  Fix: Either `name String @default("")` or ensure all display code handles
  `null` with a fallback.

- **ORM-specific (Prisma)** — `User.updatedAt` uses `@updatedAt` which only
  triggers through Prisma client writes. If any raw SQL or direct database
  updates occur (e.g., admin scripts, data migrations), `updatedAt` will
  become stale.
  Fix: Acceptable for this project since all writes go through Prisma. Add
  a comment noting this limitation.

### 🔵 Minor — worth addressing, not urgent

- **Index coverage** — `User.email` has both a `@unique` constraint (which
  creates an implicit index) and an explicit `@@index([email])`. The explicit
  index is redundant.
  Fix: Remove `@@index([email])` from the User model — the unique constraint
  already provides the index.

- **Index coverage** — `Skill.name` has both a `@unique` constraint and an
  explicit `@@index([name])`. Same redundancy as above.
  Fix: Remove `@@index([name])` from the Skill model.

- **Naming conventions** — Prisma convention uses PascalCase model names and
  camelCase field names, both of which are followed consistently. Good.

- **Structural integrity** — `WorkflowStep` references both `Workflow` and
  `Skill` with explicit cascade deletes. The `@@unique([workflowId, orderIndex])`
  prevents duplicate ordering within a workflow. Good design.

---

## Safe to run?

[x] Yes with caveats — Remove the two redundant indexes before generating the
migration. Otherwise the schema is clean, no lock risk (initial migration on
empty database), and all constraints are appropriate.

---

## Suggested migration order

Single initial migration is fine since this is a greenfield schema. No
ordering concerns.
