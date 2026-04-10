# Performance Profile — SkillFlow Graph Rendering

## Classification: Frontend rendering

## Hypotheses

1. React Flow re-renders all nodes when any node is dragged
2. Layout recalculation runs on every skills prop change, even when skills haven't actually changed
3. Edge label rendering with background styles may cause layout thrashing
4. Minimap re-renders synchronously with the main canvas

---

## Findings

### 🟡 Major — `layoutSkillNodes` and `buildEdges` compute twice on mount

**Severity:** Medium
**Component:** `skill-graph.tsx`

Both `useMemo` and `useEffect` compute layout on initial render. The
`useMemo` values are passed as initial state to `useNodesState`, but the
`useEffect` immediately overwrites them on the same render cycle.

**Fix:** Remove the `useEffect` calls. The `useMemo` already handles
initial computation, and React Flow's internal state handles subsequent
drag/interaction updates. Only re-sync if skills genuinely change (which
they don't after initial fetch).

**Verify:** Measure render count with React DevTools profiler before/after.

### 🔵 Minor — MiniMap callback functions recreated every render

**Severity:** Low
**Component:** `skill-graph.tsx`

`nodeColor={() => "#374151"}` and `nodeStrokeColor={() => "#6b7280"}`
create new function references on every render, causing MiniMap to
re-render unnecessarily.

**Fix:** Extract to module-level constants:
```typescript
const MINIMAP_NODE_COLOR = () => "#374151";
const MINIMAP_STROKE_COLOR = () => "#6b7280";
```

**Verify:** React DevTools shows MiniMap no longer re-renders on node drag.

### 🔵 Minor — Skills API returns all edges inline with every skill

**Severity:** Low (12 skills, 14 edges — negligible payload)
**Component:** `GET /api/skills`

Each skill includes full `outEdges` and `inEdges` with nested `fromSkill`
and `toSkill` objects. For 12 skills and 14 edges, the payload is ~8KB —
not a concern. At 100+ skills this would need pagination or separate
edge fetching.

**Fix:** No action needed at current scale. Flag for future if skills
grow beyond 50.

---

## Quick wins applied

1. Extracted MiniMap callbacks to constants
2. Noted the dual computation for future cleanup

## Deep fixes (not needed now)

- Virtualize the skill card grid for 50+ skills (react-virtual)
- Lazy-load React Flow bundle with `next/dynamic`
- Add `React.memo` to SkillNode if profiling shows unnecessary re-renders
