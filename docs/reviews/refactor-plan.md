# Refactor Plan — skill-graph.tsx

## Assessment

`skill-graph.tsx` is 177 lines and handles four concerns: layout calculation,
edge building, React Flow state management, and rendering. The component
itself is reasonable in size, but the layout and edge-building logic is tightly
coupled to the component, making it harder to test and reuse.

**Refactor type:** Extract — pull pure logic into hooks and utilities.

---

## Current state

- `layoutSkillNodes()` — pure function, 35 lines, converts skills to nodes
  with category-based positioning
- `buildEdges()` — pure function, 25 lines, deduplicates and formats edges
- `CATEGORY_ANCHORS` — layout configuration, magic pixel values
- `SkillGraph` component — orchestrates everything, 65 lines

**Test coverage:** None. The pure functions are untested because they're
co-located with the component.

---

## Refactor steps

### Step 1: Extract layout utilities to `src/lib/graph-layout.ts`

Move `CATEGORY_ANCHORS`, `DEFAULT_ANCHOR`, `layoutSkillNodes()`, and
`buildEdges()` to a standalone file. These are pure functions with no
React dependency.

**Verify:** `npx tsc --noEmit` passes. Existing app behaviour unchanged.

### Step 2: Write tests for the extracted layout functions

Add `src/lib/__tests__/graph-layout.test.ts` covering:
- `layoutSkillNodes` returns correct node count
- Nodes are positioned within expected regions per category
- `buildEdges` deduplicates edges by ID
- `buildEdges` returns empty array for skills with no edges

**Verify:** `npx vitest run` passes.

### Step 3: Create `useGraphData` custom hook

Extract the nodes/edges state management and the `handleNodeClick` callback
into `src/hooks/use-graph-data.ts`:
```typescript
export function useGraphData(skills: Skill[], onNodeClick: (skill: Skill) => void) {
  // nodes, edges state
  // useEffect to sync when skills change
  // handleNodeClick callback
  return { nodes, edges, onNodesChange, onEdgesChange, handleNodeClick };
}
```

**Verify:** `npx tsc --noEmit` passes. Graph renders identically.

### Step 4: Simplify `SkillGraph` to a thin render wrapper

After steps 1-3, the component should be ~30 lines: import the hook,
spread the return values into ReactFlow props.

**Verify:** All tests pass. Manual visual check confirms no layout changes.

---

## Risk assessment

- **Low risk:** All extractions are mechanical — no behaviour changes
- **Revert gate:** Each step is independently revertable via git
- **Not doing:** Node type splitting (SkillNode is already 44 lines
  and single-purpose — splitting would add complexity without benefit)
