# Code Review — skill-graph.tsx, skill-node.tsx, and API routes

## Summary

The codebase is well-structured with consistent patterns across API routes
and frontend components. Type safety is solid throughout. Two major issues
around duplicated data-fetching logic and missing error boundary for the
graph, plus a few minor naming and readability improvements. Safe to ship
after addressing the major items.

---

## Findings

### 🟡 Major — should fix, but not a blocker

- **Maintainability** `dashboard/page.tsx` and `dashboard/graph/page.tsx` —
  `parseSkillsPayload` and the entire skill-fetching `useEffect` are
  duplicated across both pages. This will drift over time as one is updated
  but the other is forgotten.
  Fix: Extract a `useSkills()` custom hook into `src/hooks/use-skills.ts`
  that returns `{ skills, loading, error }`.

- **Reliability** `skill-graph.tsx` — If React Flow throws during render
  (e.g., invalid node data), the entire page crashes with no fallback.
  Fix: Wrap `<SkillGraph>` in an error boundary component, or add
  `onError` handling to the ReactFlow component.

- **Correctness** `skill-detail-panel.tsx:43` — The `useEffect` dependency
  is `skill?.id` which uses optional chaining. If `skill` transitions from
  one skill to `null` and back to the same skill, the animation won't
  re-trigger because the `id` hasn't changed.
  Fix: Use a counter or `skill` object reference as dependency, or accept
  this as a minor UX edge case.

### 🔵 Minor — worth noting, low urgency

- **Readability** `skill-graph.tsx` — The `CATEGORY_ANCHORS` object uses
  magic pixel values (80, 420, 760, etc.) without explanation. Adding a
  brief comment about the layout grid would help future maintainers.

- **Performance** `skill-graph.tsx` — `layoutSkillNodes` and `buildEdges`
  run in both `useMemo` and the `useEffect` that calls `setNodes`. The
  `useEffect` is only needed if skills change after initial render. Since
  skills come from a parent fetch, the `useMemo` handles it. The dual
  computation is harmless but redundant.

- **Readability** `skill-node.tsx` — The `as never` cast on PrismaClient
  in `prisma.ts` is a workaround for Prisma 7's new constructor signature.
  Worth a `// TODO: Remove when Prisma 7 adapter API stabilises` comment.

---

## What's working well

- Category badge styles extracted to a shared utility (`category-styles.ts`)
  — no duplication between card and detail panel components
- All API routes follow a consistent pattern: try/catch, error logging,
  proper HTTP status codes
- The skill graph layout algorithm handles variable numbers of skills per
  category gracefully with the grid-within-anchor approach

---

## Suggested next step

Extract the duplicated skill-fetching logic into a `useSkills()` custom hook
to prevent drift between the cards page and graph page.
