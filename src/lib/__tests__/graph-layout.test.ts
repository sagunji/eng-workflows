import { describe, it, expect } from "vitest";
import { elkLayout } from "@/lib/graph-layout";
import type { GraphData, GraphEntity, GraphEdge } from "@/types/graph";

function makeSkill(id: string, name: string): GraphEntity {
  return { id, entityType: "skill", name, description: `Desc ${name}`, triggers: [], category: "quality" };
}

function makeAgent(id: string, name: string): GraphEntity {
  return { id, entityType: "agent", name, description: `Desc ${name}`, role: "implementation" };
}

function makeCommand(id: string, name: string): GraphEntity {
  return { id, entityType: "command", name, description: `Desc ${name}`, triggers: [] };
}

function makeEdge(id: string, sourceId: string, targetId: string, sourceType = "skill", targetType = "skill"): GraphEdge {
  return { id, sourceType: sourceType as GraphEdge["sourceType"], sourceId, targetType: targetType as GraphEdge["targetType"], targetId, label: "test" };
}

describe("elkLayout", () => {
  it("returns empty for no entities", async () => {
    const { nodes, edges } = await elkLayout({ entities: [], edges: [] });
    expect(nodes).toEqual([]);
    expect(edges).toEqual([]);
  });

  it("places skill nodes with finite positions", async () => {
    const data: GraphData = {
      entities: [makeSkill("s1", "a"), makeSkill("s2", "b")],
      edges: [],
    };
    const { nodes } = await elkLayout(data);
    expect(nodes).toHaveLength(2);
    expect(nodes.every((n) => n.type === "skillNode")).toBe(true);
    for (const n of nodes) {
      expect(Number.isFinite(n.position.x)).toBe(true);
      expect(Number.isFinite(n.position.y)).toBe(true);
    }
  });

  it("assigns correct node types for agents and commands", async () => {
    const data: GraphData = {
      entities: [makeSkill("s1", "skill"), makeAgent("a1", "agent"), makeCommand("c1", "cmd")],
      edges: [],
    };
    const { nodes } = await elkLayout(data);
    expect(nodes).toHaveLength(3);
    expect(nodes.find((n) => n.id === "s1")?.type).toBe("skillNode");
    expect(nodes.find((n) => n.id === "a1")?.type).toBe("agentNode");
    expect(nodes.find((n) => n.id === "c1")?.type).toBe("commandNode");
  });

  it("filters edges when target is missing", async () => {
    const data: GraphData = {
      entities: [makeSkill("s1", "a"), makeAgent("a1", "agent")],
      edges: [
        makeEdge("e1", "a1", "s1", "agent", "skill"),
        makeEdge("e-bad", "a1", "missing", "agent", "skill"),
      ],
    };
    const { edges } = await elkLayout(data);
    expect(edges).toHaveLength(1);
    expect(edges[0].id).toBe("e1");
  });
});
