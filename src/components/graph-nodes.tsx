"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { GraphSkill, GraphAgent, GraphCommand } from "@/types/graph";

/**
 * Each position gets both a source and a target handle so edges
 * can connect from/to any side. IDs follow the pattern `{side}-source`
 * and `{side}-target` which the edge builder references.
 */
function FourWayHandles({ accent = "!bg-gray-500" }: { accent?: string }) {
  return (
    <>
      <Handle type="target" position={Position.Top} id="top-target" className={`!h-1.5 !w-1.5 !border-0 ${accent}`} />
      <Handle type="source" position={Position.Top} id="top-source" className={`!h-1.5 !w-1.5 !border-0 ${accent}`} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className={`!h-1.5 !w-1.5 !border-0 ${accent}`} />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className={`!h-1.5 !w-1.5 !border-0 ${accent}`} />
      <Handle type="target" position={Position.Left} id="left-target" className={`!h-1.5 !w-1.5 !border-0 ${accent}`} />
      <Handle type="source" position={Position.Left} id="left-source" className={`!h-1.5 !w-1.5 !border-0 ${accent}`} />
      <Handle type="target" position={Position.Right} id="right-target" className={`!h-1.5 !w-1.5 !border-0 ${accent}`} />
      <Handle type="source" position={Position.Right} id="right-source" className={`!h-1.5 !w-1.5 !border-0 ${accent}`} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Skill node
// ---------------------------------------------------------------------------
const SKILL_BORDER_COLORS: Record<string, string> = {
  planning: "border-l-blue-500",
  quality: "border-l-green-500",
  debugging: "border-l-red-500",
  testing: "border-l-yellow-500",
  documentation: "border-l-purple-500",
  operations: "border-l-orange-500",
  performance: "border-l-cyan-500",
  security: "border-l-pink-500",
  database: "border-l-indigo-500",
};

const SKILL_GLOW: Record<string, string> = {
  planning: "shadow-blue-500/10",
  quality: "shadow-green-500/10",
  debugging: "shadow-red-500/10",
  testing: "shadow-yellow-500/10",
  documentation: "shadow-purple-500/10",
  operations: "shadow-orange-500/10",
  performance: "shadow-cyan-500/10",
  security: "shadow-pink-500/10",
  database: "shadow-indigo-500/10",
};

export type SkillNodeData = { entity: GraphSkill };
export type SkillNodeType = Node<SkillNodeData, "skillNode">;

export function SkillNode({ data, selected }: NodeProps<SkillNodeType>) {
  const { entity } = data;
  const cat = entity.category.trim().toLowerCase();
  const border = SKILL_BORDER_COLORS[cat] ?? "border-l-gray-500";
  const glow = SKILL_GLOW[cat] ?? "shadow-gray-500/10";

  return (
    <div
      className={`w-[240px] rounded-xl border-l-4 bg-gray-900/95 p-3.5 shadow-lg backdrop-blur-sm transition-all duration-200 ${border} ${glow} ${
        selected
          ? "ring-2 ring-cyan-500/50 shadow-xl"
          : "border border-gray-700/60"
      }`}
    >
      <FourWayHandles />
      <div className="mb-1 flex items-center gap-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gray-800 text-[10px] font-bold text-gray-400">
          S
        </span>
        <h3 className="truncate text-sm font-semibold text-white">
          {entity.name}
        </h3>
      </div>
      <p className="truncate text-xs leading-relaxed text-gray-400">
        {entity.description}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Agent node
// ---------------------------------------------------------------------------
const AGENT_ROLE_COLORS: Record<
  string,
  { border: string; badge: string; glow: string }
> = {
  coordination: {
    border: "from-violet-500 to-cyan-500",
    badge: "bg-violet-500/20 text-violet-300",
    glow: "shadow-violet-500/15",
  },
  implementation: {
    border: "from-emerald-500 to-teal-500",
    badge: "bg-emerald-500/20 text-emerald-300",
    glow: "shadow-emerald-500/15",
  },
  verification: {
    border: "from-amber-500 to-yellow-500",
    badge: "bg-amber-500/20 text-amber-300",
    glow: "shadow-amber-500/15",
  },
  review: {
    border: "from-rose-500 to-pink-500",
    badge: "bg-rose-500/20 text-rose-300",
    glow: "shadow-rose-500/15",
  },
  testing: {
    border: "from-yellow-500 to-orange-500",
    badge: "bg-yellow-500/20 text-yellow-300",
    glow: "shadow-yellow-500/15",
  },
  security: {
    border: "from-pink-500 to-red-500",
    badge: "bg-pink-500/20 text-pink-300",
    glow: "shadow-pink-500/15",
  },
  documentation: {
    border: "from-purple-500 to-indigo-500",
    badge: "bg-purple-500/20 text-purple-300",
    glow: "shadow-purple-500/15",
  },
  analysis: {
    border: "from-sky-500 to-blue-500",
    badge: "bg-sky-500/20 text-sky-300",
    glow: "shadow-sky-500/15",
  },
  release: {
    border: "from-orange-500 to-amber-500",
    badge: "bg-orange-500/20 text-orange-300",
    glow: "shadow-orange-500/15",
  },
};

const DEFAULT_AGENT_STYLE = {
  border: "from-gray-500 to-gray-600",
  badge: "bg-gray-500/20 text-gray-300",
  glow: "shadow-gray-500/15",
};

export type AgentNodeData = { entity: GraphAgent };
export type AgentNodeType = Node<AgentNodeData, "agentNode">;

export function AgentNode({ data, selected }: NodeProps<AgentNodeType>) {
  const { entity } = data;
  const style = AGENT_ROLE_COLORS[entity.role] ?? DEFAULT_AGENT_STYLE;

  return (
    <div
      className={`w-[240px] overflow-hidden rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-200 ${style.glow} ${
        selected ? "ring-2 ring-cyan-500/50 shadow-xl" : ""
      }`}
    >
      <div className={`h-1 bg-gradient-to-r ${style.border}`} />
      <div className="bg-gray-900/95 p-3.5 border border-t-0 border-gray-700/60 rounded-b-2xl">
        <FourWayHandles />
        <div className="mb-1 flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-800 text-[10px] font-bold text-gray-300">
            A
          </span>
          <h3 className="truncate text-sm font-semibold text-white">
            {entity.name}
          </h3>
        </div>
        <p className="truncate text-xs leading-relaxed text-gray-400">
          {entity.description}
        </p>
        <span
          className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${style.badge}`}
        >
          {entity.role}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Command node
// ---------------------------------------------------------------------------
export type CommandNodeData = { entity: GraphCommand };
export type CommandNodeType = Node<CommandNodeData, "commandNode">;

export function CommandNode({ data, selected }: NodeProps<CommandNodeType>) {
  const { entity } = data;

  return (
    <div
      className={`w-[220px] rounded-lg border border-dashed border-amber-500/40 bg-gray-950/95 p-3.5 shadow-lg shadow-amber-500/5 backdrop-blur-sm transition-all duration-200 ${
        selected ? "ring-2 ring-amber-500/50 shadow-amber-500/20 shadow-xl" : ""
      }`}
    >
      <FourWayHandles accent="!bg-amber-600/80" />
      <div className="mb-1 flex items-center gap-2">
        <span className="font-mono text-sm font-bold text-amber-400">/</span>
        <h3 className="truncate text-sm font-semibold text-amber-200">
          {entity.name}
        </h3>
      </div>
      <p className="truncate text-xs leading-relaxed text-gray-400">
        {entity.description}
      </p>
    </div>
  );
}
