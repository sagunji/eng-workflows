import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { SkillGraph, applyGraphFilter } from "@/components/skill-graph";
import type { GraphData, GraphEntity, GraphEdge } from "@/types/graph";

vi.mock("@/lib/graph-layout", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/graph-layout")>();
  return {
    ...actual,
    elkLayout: vi.fn(),
  };
});

vi.mock("@/hooks/use-force-layout", () => ({
  default: () => ({ start: undefined, drag: undefined, stop: undefined }),
}));

import { elkLayout } from "@/lib/graph-layout";

function makeSkill(id: string, name: string): GraphEntity {
  return {
    id,
    entityType: "skill",
    name,
    description: "d",
    triggers: [],
    category: "quality",
  };
}

function makeAgent(id: string, name: string): GraphEntity {
  return {
    id,
    entityType: "agent",
    name,
    description: "d",
    role: "implementation",
  };
}

function makeCommand(id: string, name: string): GraphEntity {
  return {
    id,
    entityType: "command",
    name,
    description: "d",
    triggers: [],
  };
}

function makeEdge(
  id: string,
  sourceId: string,
  targetId: string,
  sourceType: GraphEdge["sourceType"],
  targetType: GraphEdge["targetType"],
): GraphEdge {
  return { id, sourceId, targetId, sourceType, targetType, label: "l" };
}

describe("applyGraphFilter", () => {
  const data: GraphData = {
    entities: [
      makeSkill("s1", "S1"),
      makeAgent("a1", "A1"),
      makeCommand("c1", "C1"),
    ],
    edges: [
      makeEdge("e1", "a1", "s1", "agent", "skill"),
      makeEdge("e2", "c1", "a1", "command", "agent"),
    ],
  };

  it("returns only selected types when no focus", () => {
    const out = applyGraphFilter(data, {
      entityTypes: new Set(["skill", "agent"]),
    });
    expect(out.entities.map((e) => e.id).sort()).toEqual(["a1", "s1"]);
    expect(out.edges.map((e) => e.id)).toEqual(["e1"]);
  });

  it("returns ego network for focus intersected with types", () => {
    const out = applyGraphFilter(data, {
      entityTypes: new Set(["skill", "agent", "command"]),
      focusEntity: "a1",
    });
    expect(out.entities.map((e) => e.id).sort()).toEqual(["a1", "c1", "s1"]);
    expect(out.edges.length).toBe(2);
  });

  it("excludes neighbors whose type is toggled off", () => {
    const out = applyGraphFilter(data, {
      entityTypes: new Set(["agent"]),
      focusEntity: "a1",
    });
    expect(out.entities.map((e) => e.id)).toEqual(["a1"]);
    expect(out.edges).toEqual([]);
  });

  it("returns empty when entityTypes is empty", () => {
    const out = applyGraphFilter(data, {
      entityTypes: new Set(),
    });
    expect(out.entities).toEqual([]);
    expect(out.edges).toEqual([]);
  });
});

describe("SkillGraph", () => {
  beforeEach(() => {
    vi.mocked(elkLayout).mockImplementation(async (g: GraphData) => {
      if (g.entities.length === 0) {
        return { nodes: [], edges: [] };
      }
      return {
        nodes: g.entities.map((e) => ({
          id: e.id,
          type:
            e.entityType === "skill"
              ? "skillNode"
              : e.entityType === "agent"
                ? "agentNode"
                : "commandNode",
          position: { x: 0, y: 0 },
          data: { entity: e },
        })),
        edges: [],
      };
    });
  });

  it("renders without throwing for empty graph data", async () => {
    const { container } = render(
      <div style={{ width: 400, height: 300 }}>
        <SkillGraph data={{ entities: [], edges: [] }} onNodeClick={vi.fn()} />
      </div>,
    );

    await waitFor(() => {
      expect(container.querySelector(".react-flow")).toBeTruthy();
    });
  });

  it("hides the layout indicator after ELK resolves", async () => {
    render(
      <div style={{ width: 400, height: 300 }}>
        <SkillGraph
          data={{
            entities: [makeSkill("s1", "One")],
            edges: [],
          }}
          onNodeClick={vi.fn()}
        />
      </div>,
    );

    expect(screen.getByText(/Laying out graph/)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/Laying out graph/)).not.toBeInTheDocument();
    });
  });

  it("passes filtered data to elkLayout when filter is set", async () => {
    const data: GraphData = {
      entities: [makeSkill("s1", "S"), makeAgent("a1", "A")],
      edges: [],
    };
    render(
      <div style={{ width: 400, height: 300 }}>
        <SkillGraph
          data={data}
          filter={{
            entityTypes: new Set(["skill"]),
          }}
          onNodeClick={vi.fn()}
        />
      </div>,
    );

    await waitFor(() => {
      expect(vi.mocked(elkLayout)).toHaveBeenCalled();
    });
    const lastCall = vi.mocked(elkLayout).mock.calls.at(-1)?.[0];
    expect(lastCall?.entities).toHaveLength(1);
    expect(lastCall?.entities[0].id).toBe("s1");
  });
});
