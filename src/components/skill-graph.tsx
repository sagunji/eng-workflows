"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  applyEdgeChanges,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { SkillNode, AgentNode, CommandNode } from "@/components/graph-nodes";
import {
  edgeStyle,
  elkLayout,
  type SkillFlowEdgeData,
} from "@/lib/graph-layout";
import type { EntityType, GraphData, GraphEntity } from "@/types/graph";

const FLOW_EDGE_LABEL_STYLE = {
  fill: "#d1d5db",
  fontSize: 10,
  fontWeight: 500,
} as const;

const FLOW_EDGE_LABEL_BG_STYLE = {
  fill: "#030712",
  fillOpacity: 0.92,
} as const;

const FLOW_EDGE_LABEL_BG_PADDING: [number, number] = [3, 5];

const BASELINE_EDGE_OPACITY = 0.25;
const DIMMED_EDGE_OPACITY = 0.15;

type LayoutEdge = Edge<SkillFlowEdgeData>;

/**
 * Applies progressive disclosure: baseline / dimmed vs focused incident edges with labels.
 */
function edgesForFocusNode(
  baseEdges: LayoutEdge[],
  focusNodeId: string | null,
): Edge[] {
  return baseEdges.map((edge) => {
    const data = edge.data;
    if (!data) return edge;
    const baseStroke = edgeStyle(data.sourceType, data.targetType);
    const isIncident =
      focusNodeId !== null &&
      (edge.source === focusNodeId || edge.target === focusNodeId);

    if (focusNodeId === null) {
      return {
        ...edge,
        label: undefined,
        labelStyle: undefined,
        labelBgStyle: undefined,
        labelBgPadding: undefined,
        animated: false,
        zIndex: undefined,
        className: "skillflow-edge",
        style: { ...baseStroke, opacity: BASELINE_EDGE_OPACITY, strokeWidth: 1 },
      };
    }

    if (isIncident) {
      return {
        ...edge,
        label: data.label,
        labelStyle: { ...FLOW_EDGE_LABEL_STYLE },
        labelBgStyle: { ...FLOW_EDGE_LABEL_BG_STYLE },
        labelBgPadding: FLOW_EDGE_LABEL_BG_PADDING,
        animated: data.isAgentAgent,
        zIndex: 1,
        className: "skillflow-edge skillflow-edge--highlight",
        style: { ...baseStroke, opacity: 1 },
      };
    }

    return {
      ...edge,
      label: undefined,
      labelStyle: undefined,
      labelBgStyle: undefined,
      labelBgPadding: undefined,
      animated: false,
      zIndex: undefined,
      className: "skillflow-edge",
      style: {
        ...baseStroke,
        opacity: DIMMED_EDGE_OPACITY,
        strokeWidth: 1,
      },
    };
  });
}

const nodeTypes = {
  skillNode: SkillNode,
  agentNode: AgentNode,
  commandNode: CommandNode,
};

const MINIMAP_NODE_COLOR = (node: Node) => {
  if (node.type === "agentNode") return "#8b5cf6";
  if (node.type === "commandNode") return "#f59e0b";
  return "#374151";
};
const MINIMAP_NODE_STROKE = () => "#6b7280";
const FIT_VIEW_OPTIONS = { padding: 0.15, maxZoom: 1 } as const;

export interface GraphFilter {
  entityTypes: Set<EntityType>;
  focusEntity?: string;
}

export interface SkillGraphProps {
  data: GraphData;
  filter?: GraphFilter;
  /** Pass `null` when the same node is clicked again to close the detail panel. */
  onNodeClick?: (entity: GraphEntity | null) => void;
  /** Sync selection when the detail panel closes or opens outside the graph. */
  selectedEntityId?: string | null;
}

export function applyGraphFilter(
  data: GraphData,
  filter: GraphFilter,
): GraphData {
  const { entityTypes, focusEntity } = filter;
  if (entityTypes.size === 0) {
    return { entities: [], edges: [] };
  }

  const matchesType = (e: GraphEntity) => entityTypes.has(e.entityType);

  let allowedIds: Set<string>;
  if (focusEntity) {
    const ego = new Set<string>([focusEntity]);
    for (const edge of data.edges) {
      if (edge.sourceId === focusEntity) ego.add(edge.targetId);
      if (edge.targetId === focusEntity) ego.add(edge.sourceId);
    }
    allowedIds = new Set(
      data.entities
        .filter((e) => ego.has(e.id) && matchesType(e))
        .map((e) => e.id),
    );
  } else {
    allowedIds = new Set(data.entities.filter(matchesType).map((e) => e.id));
  }

  const entities = data.entities.filter((e) => allowedIds.has(e.id));
  const edges = data.edges.filter(
    (e) => allowedIds.has(e.sourceId) && allowedIds.has(e.targetId),
  );
  return { entities, edges };
}

function SkillGraphCanvas({
  data,
  filter,
  onNodeClick,
  selectedEntityId,
}: SkillGraphProps) {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [baseEdges, setBaseEdges] = useState<LayoutEdge[]>([]);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [layoutPending, setLayoutPending] = useState(false);

  useEffect(() => {
    setSelectedNodeId(selectedEntityId ?? null);
  }, [selectedEntityId]);

  const focusNodeId = useMemo(
    () => hoveredNodeId ?? selectedNodeId,
    [hoveredNodeId, selectedNodeId],
  );

  const edges = useMemo(
    () => edgesForFocusNode(baseEdges, focusNodeId),
    [baseEdges, focusNodeId],
  );

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setBaseEdges((eds) => applyEdgeChanges(changes as EdgeChange<LayoutEdge>[], eds));
  }, []);

  const layoutData = useMemo(() => {
    if (!filter) return data;
    return applyGraphFilter(data, filter);
  }, [data, filter]);

  useEffect(() => {
    let cancelled = false;

    async function runLayout() {
      if (layoutData.entities.length === 0) {
        setNodes([]);
        setBaseEdges([]);
        return;
      }

      setLayoutPending(true);
      try {
        const result = await elkLayout(layoutData);
        if (!cancelled) {
          setNodes(result.nodes);
          setBaseEdges(result.edges);
        }
      } catch (err) {
        console.error("ELK layout failed", err);
        if (!cancelled) {
          setNodes([]);
          setBaseEdges([]);
        }
      } finally {
        if (!cancelled) setLayoutPending(false);
      }
    }

    void runLayout();
    return () => {
      cancelled = true;
    };
  }, [layoutData, setNodes]);

  useEffect(() => {
    if (layoutPending || nodes.length === 0) return;
    const timeout = setTimeout(() => {
      void fitView(FIT_VIEW_OPTIONS);
    }, 300);
    return () => clearTimeout(timeout);
  }, [layoutPending, nodes.length, fitView]);

  const handleNodeClick = useCallback<NodeMouseHandler>(
    (_event, node) => {
      const entity = (node.data as { entity?: GraphEntity })?.entity;
      if (!entity || !onNodeClick) return;

      if (selectedNodeId === node.id) {
        setSelectedNodeId(null);
        onNodeClick(null);
        return;
      }

      setSelectedNodeId(node.id);
      onNodeClick(entity);
    },
    [onNodeClick, selectedNodeId],
  );

  const handleNodeMouseEnter = useCallback<NodeMouseHandler>(
    (_event, node) => {
      setHoveredNodeId(node.id);
    },
    [],
  );

  const handleNodeMouseLeave = useCallback<NodeMouseHandler>(() => {
    setHoveredNodeId(null);
  }, []);

  return (
    <div className="relative h-full w-full bg-gray-950">
      {layoutPending && layoutData.entities.length > 0 && (
        <div
          className="pointer-events-none absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-gray-700/80 bg-gray-900/90 px-3 py-1.5 text-xs text-gray-300 shadow-lg backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <span
            className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-600 border-t-cyan-500"
            aria-hidden
          />
          Laying out graph…
        </div>
      )}
      <ReactFlow<Node, Edge>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        colorMode="dark"
        fitView
        fitViewOptions={FIT_VIEW_OPTIONS}
        minZoom={0.08}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: "default" }}
      >
        <Background
          id="skillflow-dots"
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(148, 163, 184, 0.08)"
        />
        <Controls
          className="!overflow-hidden !rounded-lg !border !border-gray-700 !bg-gray-900/95 !shadow-lg [&_button]:!border-gray-700 [&_button]:!bg-gray-900 [&_button]:!text-gray-200 [&_button:hover]:!bg-gray-800"
          showInteractive={false}
          position="top-right"
        />
        <MiniMap
          className="!overflow-hidden !rounded-lg !border !border-gray-700 !bg-gray-900/95 !shadow-lg"
          maskColor="rgba(3, 7, 18, 0.65)"
          nodeColor={MINIMAP_NODE_COLOR}
          nodeStrokeColor={MINIMAP_NODE_STROKE}
          nodeStrokeWidth={1}
          pannable
          zoomable
          position="bottom-left"
        />
      </ReactFlow>
    </div>
  );
}

export function SkillGraph(props: SkillGraphProps) {
  return (
    <ReactFlowProvider>
      <SkillGraphCanvas {...props} />
    </ReactFlowProvider>
  );
}
