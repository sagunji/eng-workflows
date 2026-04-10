export type EntityType = "skill" | "agent" | "command";

export interface GraphSkill {
  id: string;
  entityType: "skill";
  name: string;
  description: string;
  triggers: string[];
  category: string;
}

export interface GraphAgent {
  id: string;
  entityType: "agent";
  name: string;
  description: string;
  role: string;
}

export interface GraphCommand {
  id: string;
  entityType: "command";
  name: string;
  description: string;
  triggers: string[];
}

export type GraphEntity = GraphSkill | GraphAgent | GraphCommand;

export interface GraphEdge {
  id: string;
  sourceType: EntityType;
  sourceId: string;
  targetType: EntityType;
  targetId: string;
  label: string;
}

export interface GraphData {
  entities: GraphEntity[];
  edges: GraphEdge[];
}
