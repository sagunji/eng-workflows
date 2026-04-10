import { describe, it, expect } from "vitest";
import graphData from "../../../public/graph.json";
import type { GraphData, EntityType } from "@/types/graph";

const VALID_ENTITY_TYPES: EntityType[] = ["skill", "agent", "command"];

describe("public/graph.json", () => {
  const data = graphData as GraphData;

  it("has entities and edges arrays", () => {
    expect(Array.isArray(data.entities)).toBe(true);
    expect(Array.isArray(data.edges)).toBe(true);
  });

  it("contains the expected number of entities (13 skills, 13 agents, 6 commands)", () => {
    const skills = data.entities.filter((e) => e.entityType === "skill");
    const agents = data.entities.filter((e) => e.entityType === "agent");
    const commands = data.entities.filter((e) => e.entityType === "command");

    expect(skills).toHaveLength(13);
    expect(agents).toHaveLength(13);
    expect(commands).toHaveLength(6);
    expect(data.entities).toHaveLength(32);
  });

  it("every entity has a unique id", () => {
    const ids = data.entities.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every entity has valid entityType", () => {
    for (const entity of data.entities) {
      expect(VALID_ENTITY_TYPES).toContain(entity.entityType);
    }
  });

  it("every entity has required fields", () => {
    for (const entity of data.entities) {
      expect(entity.id).toBeTruthy();
      expect(entity.name).toBeTruthy();
      expect(entity.description).toBeTruthy();
    }
  });

  it("every edge references valid entity IDs", () => {
    const entityIds = new Set(data.entities.map((e) => e.id));
    for (const edge of data.edges) {
      expect(entityIds.has(edge.sourceId)).toBe(true);
      expect(entityIds.has(edge.targetId)).toBe(true);
    }
  });

  it("every edge has valid source and target types", () => {
    for (const edge of data.edges) {
      expect(VALID_ENTITY_TYPES).toContain(edge.sourceType);
      expect(VALID_ENTITY_TYPES).toContain(edge.targetType);
    }
  });

  it("edge IDs are unique", () => {
    const ids = data.edges.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses deterministic ID format", () => {
    for (const entity of data.entities) {
      if (entity.entityType === "skill") {
        expect(entity.id).toMatch(/^skill-/);
      } else if (entity.entityType === "agent") {
        expect(entity.id).toMatch(/^agent-/);
      } else {
        expect(entity.id).toMatch(/^cmd-/);
      }
    }
  });
});
