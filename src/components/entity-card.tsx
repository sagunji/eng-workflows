"use client";

import type { GraphEntity } from "@/types/graph";
import { badgeClasses, categoryBorderLeftClass } from "@/lib/category-styles";

/**
 * Role keys and gradient/badge styles aligned with `graph-nodes.tsx` agent nodes
 * (duplicated here so this file stays independent of graph components).
 */
const AGENT_ROLE_STYLES: Record<
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

/** Ordered role ids for dashboard sub-filters (matches known agent roles in the graph). */
export const AGENT_ROLE_FILTER_TABS: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "coordination", label: "Coordination" },
  { id: "implementation", label: "Implementation" },
  { id: "verification", label: "Verification" },
  { id: "review", label: "Review" },
  { id: "testing", label: "Testing" },
  { id: "security", label: "Security" },
  { id: "documentation", label: "Documentation" },
  { id: "analysis", label: "Analysis" },
  { id: "release", label: "Release" },
];

const CARD_FOCUS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950";

const CARD_HOVER =
  "transition-all duration-200 hover:scale-[1.02] hover:border-gray-600 hover:shadow-xl hover:shadow-black/25";

export interface EntityCardProps {
  /** Graph entity to display (skill, agent, or command). */
  entity: GraphEntity;
  /** Number of edges incident on this entity (undirected count). */
  connectionCount: number;
  /** Invoked when the card is activated. */
  onClick: (entity: GraphEntity) => void;
}

/**
 * Card for a single graph entity: skills use category badge and left accent;
 * agents use a gradient top bar and role badge; commands use a dashed amber frame and `/` prefix.
 */
export function EntityCard({
  entity,
  connectionCount,
  onClick,
}: EntityCardProps) {
  const connectionLabel =
    connectionCount === 1 ? "1 connection" : `${connectionCount} connections`;

  if (entity.entityType === "skill") {
    const left = categoryBorderLeftClass(entity.category);
    return (
      <button
        type="button"
        onClick={() => onClick(entity)}
        className={`group w-full text-left rounded-xl border border-gray-800 border-l-4 ${left} bg-gray-900 p-5 shadow-lg shadow-black/20 ${CARD_HOVER} ${CARD_FOCUS}`}
      >
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${badgeClasses(entity.category)}`}
        >
          {entity.category}
        </span>
        <h3 className="mt-3 font-semibold text-lg text-white">{entity.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-gray-400">
          {entity.description}
        </p>
        <p className="mt-4 text-xs text-gray-500">{connectionLabel}</p>
      </button>
    );
  }

  if (entity.entityType === "agent") {
    const style = AGENT_ROLE_STYLES[entity.role] ?? DEFAULT_AGENT_STYLE;
    return (
      <button
        type="button"
        onClick={() => onClick(entity)}
        className={`group w-full overflow-hidden text-left rounded-xl shadow-lg shadow-black/20 ${CARD_HOVER} ${CARD_FOCUS} ${style.glow}`}
      >
        <div className={`h-1 bg-gradient-to-r ${style.border}`} />
        <div className="rounded-b-xl border border-t-0 border-gray-800 bg-gray-900 p-5 transition-colors group-hover:border-gray-600">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style.badge}`}
          >
            {entity.role}
          </span>
          <h3 className="mt-3 font-semibold text-lg text-white">
            {entity.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-gray-400">
            {entity.description}
          </p>
          <p className="mt-4 text-xs text-gray-500">{connectionLabel}</p>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick(entity)}
      className={`group w-full text-left rounded-xl border border-dashed border-amber-500/40 bg-gray-950/95 p-5 shadow-lg shadow-amber-500/5 shadow-black/20 ${CARD_HOVER} ${CARD_FOCUS}`}
    >
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-sm font-bold text-amber-400">/</span>
        <h3 className="font-semibold text-lg text-amber-200">{entity.name}</h3>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-gray-400">
        {entity.description}
      </p>
      <p className="mt-4 text-xs text-gray-500">{connectionLabel}</p>
    </button>
  );
}
