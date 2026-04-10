import { useEffect, useRef, useMemo } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceX,
  forceY,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import {
  useReactFlow,
  useStore,
  useNodesInitialized,
  type ReactFlowProps,
  type ReactFlowState,
  type Node,
} from "@xyflow/react";

type SimNodeType = SimulationNodeDatum & Node;
type SimEdgeType = SimulationLinkDatum<SimNodeType>;

type DragEvents = {
  start: ReactFlowProps["onNodeDragStart"];
  drag: ReactFlowProps["onNodeDrag"];
  stop: ReactFlowProps["onNodeDragStop"];
};

export interface UseForceLayoutOptions {
  strength?: number;
  distance?: number;
  collideRadius?: number;
}

const elementCountSelector = (state: ReactFlowState) =>
  state.nodes.length + state.edges.length;

export default function useForceLayout({
  strength = -1200,
  distance = 180,
  collideRadius = 130,
}: UseForceLayoutOptions = {}) {
  const elementCount = useStore(elementCountSelector);
  const nodesInitialized = useNodesInitialized();
  const { setNodes, getNodes, getEdges } = useReactFlow();

  const draggingNodeRef = useRef<null | Node>(null);
  const simulationNodesRef = useRef<SimNodeType[]>([]);
  const simulationRef = useRef<ReturnType<
    typeof forceSimulation<SimNodeType>
  > | null>(null);

  const dragEvents = useMemo<DragEvents>(
    () => ({
      start: (_event, node) => {
        draggingNodeRef.current = node;
        simulationRef.current?.alpha(0.3).restart();
      },
      drag: (_event, node) => {
        draggingNodeRef.current = node;
        const simNode = simulationNodesRef.current.find(
          (n) => n.id === node.id,
        );
        if (simNode) {
          simNode.fx = node.position.x;
          simNode.fy = node.position.y;
        }
        simulationRef.current?.alpha(0.3).restart();
      },
      stop: () => {
        if (draggingNodeRef.current) {
          const simNode = simulationNodesRef.current.find(
            (n) => n.id === draggingNodeRef.current?.id,
          );
          if (simNode) {
            delete simNode.fx;
            delete simNode.fy;
          }
        }
        draggingNodeRef.current = null;
        simulationRef.current?.alpha(0.5).restart();
      },
    }),
    [],
  );

  useEffect(() => {
    const nodes = getNodes();
    const edges = getEdges();

    if (!nodes.length || !nodesInitialized) {
      return;
    }

    const simulationNodes: SimNodeType[] = nodes.map((node) => ({
      ...node,
      x: node.position.x,
      y: node.position.y,
    }));
    simulationNodesRef.current = simulationNodes;

    const simulationLinks: SimEdgeType[] = edges.map((edge) => edge);

    const simulation = forceSimulation<SimNodeType>()
      .nodes(simulationNodes)
      .force("charge", forceManyBody().strength(strength))
      .force(
        "link",
        forceLink<SimNodeType, SimEdgeType>(simulationLinks)
          .id((d) => d.id)
          .strength(0.05)
          .distance(distance),
      )
      .force("collide", forceCollide<SimNodeType>().radius(collideRadius))
      .force("x", forceX().x(0).strength(0.06))
      .force("y", forceY().y(0).strength(0.06))
      .alphaDecay(0.02)
      .on("tick", () => {
        setNodes((currentNodes) =>
          currentNodes.map((node, i) => {
            const simNode = simulationNodes[i];
            if (!simNode) return node;

            const dragging = draggingNodeRef.current?.id === node.id;
            if (dragging) {
              simNode.fx = node.position.x;
              simNode.fy = node.position.y;
              return node;
            }

            delete simNode.fx;
            delete simNode.fy;
            return {
              ...node,
              position: { x: simNode.x ?? 0, y: simNode.y ?? 0 },
            };
          }),
        );
      });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [
    elementCount,
    getNodes,
    getEdges,
    setNodes,
    strength,
    distance,
    collideRadius,
    nodesInitialized,
  ]);

  return dragEvents;
}
