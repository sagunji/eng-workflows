import type { Edge, Node } from "@xyflow/react";
import type { ElkNode } from "elkjs/lib/elk-api";
import ELK from "elkjs/lib/elk.bundled.js";
import type {
  EntityType,
  GraphData,
  GraphEntity,
  GraphEdge as GEdge,
} from "@/types/graph";

const elk = new ELK();

const NODE_WIDTH = 240;
const NODE_HEIGHT = 90;
const CMD_WIDTH = 220;

const LAYOUT_OPTIONS = {
  "elk.algorithm": "stress",
  "elk.stress.desiredEdgeLength": "420",
  "elk.stress.epsilon": "0.001",
  "elk.spacing.nodeNode": "180",
  "elk.separateConnectedComponents": "true",
  "elk.spacing.componentComponent": "300",
} as const;

function nodeType(entity: GraphEntity): string {
  if (entity.entityType === "skill") return "skillNode";
  if (entity.entityType === "agent") return "agentNode";
  return "commandNode";
}

function nodeWidth(entity: GraphEntity): number {
  return entity.entityType === "command" ? CMD_WIDTH : NODE_WIDTH;
}

/** Stroke styles by graph edge type pair (used for layout edges and focus highlighting). */
export function edgeStyle(sourceType: string, targetType: string) {
  if (sourceType === "agent" && targetType === "agent") {
    return { stroke: "#8b5cf6", strokeWidth: 2, strokeDasharray: "6 3" };
  }
  if (sourceType === "agent" && targetType === "command") {
    return { stroke: "#f59e0b", strokeWidth: 1.5, strokeDasharray: "4 4" };
  }
  if (sourceType === "command" && targetType === "agent") {
    return { stroke: "#f59e0b", strokeWidth: 1.5, strokeDasharray: "4 4" };
  }
  if (sourceType === "command" && targetType === "command") {
    return { stroke: "#f59e0b", strokeWidth: 1.5 };
  }
  if (
    (sourceType === "agent" || sourceType === "command") &&
    targetType === "skill"
  ) {
    return { stroke: "#6b7280", strokeWidth: 1.5 };
  }
  return { stroke: "#6b7280", strokeWidth: 1.5 };
}

/** React Flow edge `data` for progressive disclosure (labels + animation flags). */
export interface SkillFlowEdgeData extends Record<string, unknown> {
  label: string;
  sourceType: EntityType;
  targetType: EntityType;
  isAgentAgent: boolean;
}

/**
 * Pick the best source/target handle pair based on relative positions
 * of the two nodes. This spreads edges across all 4 sides and reduces
 * overlapping bundles.
 */
function pickHandles(
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  tx: number,
  ty: number,
  tw: number,
  th: number,
): { sourceHandle: string; targetHandle: string } {
  const scx = sx + sw / 2;
  const scy = sy + sh / 2;
  const tcx = tx + tw / 2;
  const tcy = ty + th / 2;

  const dx = tcx - scx;
  const dy = tcy - scy;

  let sourceHandle: string;
  let targetHandle: string;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) {
      sourceHandle = "right-source";
      targetHandle = "left-target";
    } else {
      sourceHandle = "left-source";
      targetHandle = "right-target";
    }
  } else {
    if (dy > 0) {
      sourceHandle = "bottom-source";
      targetHandle = "top-target";
    } else {
      sourceHandle = "top-source";
      targetHandle = "bottom-target";
    }
  }

  return { sourceHandle, targetHandle };
}

export function buildFlowEdges(
  graphEdges: GEdge[],
  entityIds: Set<string>,
  nodePositions?: Map<string, { x: number; y: number; w: number; h: number }>,
): Edge<SkillFlowEdgeData>[] {
  return graphEdges
    .filter((e) => entityIds.has(e.sourceId) && entityIds.has(e.targetId))
    .map((e) => {
      let handles: { sourceHandle?: string; targetHandle?: string } = {};
      if (nodePositions) {
        const sp = nodePositions.get(e.sourceId);
        const tp = nodePositions.get(e.targetId);
        if (sp && tp) {
          handles = pickHandles(sp.x, sp.y, sp.w, sp.h, tp.x, tp.y, tp.w, tp.h);
        }
      }
      const baseStroke = edgeStyle(e.sourceType, e.targetType);
      return {
        id: e.id,
        source: e.sourceId,
        target: e.targetId,
        sourceHandle: handles.sourceHandle,
        targetHandle: handles.targetHandle,
        type: "default",
        animated: false,
        className: "skillflow-edge",
        style: { ...baseStroke, opacity: 0.15, strokeWidth: 1 },
        data: {
          label: e.label,
          sourceType: e.sourceType,
          targetType: e.targetType,
          isAgentAgent: e.sourceType === "agent" && e.targetType === "agent",
        },
      };
    });
}

export interface ElkLayoutResult {
  nodes: Node[];
  edges: Edge<SkillFlowEdgeData>[];
}

export async function elkLayout(data: GraphData): Promise<ElkLayoutResult> {
  if (data.entities.length === 0) return { nodes: [], edges: [] };

  const entityMap = new Map(data.entities.map((e) => [e.id, e] as const));
  const entityIds = new Set(data.entities.map((e) => e.id));

  const elkChildren: ElkNode[] = data.entities.map((e) => ({
    id: e.id,
    width: nodeWidth(e),
    height: NODE_HEIGHT,
  }));

  const elkEdges = data.edges
    .filter((e) => entityIds.has(e.sourceId) && entityIds.has(e.targetId))
    .map((e) => ({ id: e.id, sources: [e.sourceId], targets: [e.targetId] }));

  const graph: ElkNode = {
    id: "root",
    layoutOptions: { ...LAYOUT_OPTIONS },
    children: elkChildren,
    edges: elkEdges,
  };

  const laidOut = await elk.layout(graph);

  const nodePositions = new Map<
    string,
    { x: number; y: number; w: number; h: number }
  >();

  const nodes = (laidOut.children ?? [])
    .map((child) => {
      const entity = entityMap.get(child.id);
      if (!entity) return null;
      const w = child.width ?? nodeWidth(entity);
      const h = child.height ?? NODE_HEIGHT;
      nodePositions.set(child.id, {
        x: child.x ?? 0,
        y: child.y ?? 0,
        w,
        h,
      });
      return {
        id: child.id,
        type: nodeType(entity),
        position: { x: child.x ?? 0, y: child.y ?? 0 },
        data: { entity },
      };
    })
    .filter((n) => n !== null) as Node[];

  const edges = buildFlowEdges(data.edges, entityIds, nodePositions);

  return { nodes, edges };
}
