"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { EntityCard, AGENT_ROLE_FILTER_TABS } from "@/components/entity-card";
import { EntityDetailPanel } from "@/components/entity-detail-panel";
import { useGraphData } from "@/hooks/use-graph-data";
import type { GraphEntity } from "@/types/graph";

const ENTITY_TYPE_TABS: {
  id: "all" | "skill" | "agent" | "command";
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "skill", label: "Skills" },
  { id: "agent", label: "Agents" },
  { id: "command", label: "Commands" },
];

const SKILL_CATEGORY_TABS: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "planning", label: "Planning" },
  { id: "quality", label: "Quality" },
  { id: "debugging", label: "Debugging" },
  { id: "testing", label: "Testing" },
  { id: "documentation", label: "Documentation" },
  { id: "operations", label: "Operations" },
  { id: "performance", label: "Performance" },
  { id: "security", label: "Security" },
  { id: "database", label: "Database" },
];

function entityCardSkeleton(kind: "skill" | "agent" | "command") {
  if (kind === "agent") {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-800 shadow-lg shadow-black/20">
        <div className="h-1 animate-pulse bg-gradient-to-r from-gray-700 to-gray-600" />
        <div className="border-t-0 bg-gray-900 p-5">
          <div className="h-5 w-24 animate-pulse rounded-full bg-gray-800" />
          <div className="mt-3 h-6 w-3/4 animate-pulse rounded-md bg-gray-800" />
          <div className="mt-2 h-4 w-full animate-pulse rounded-md bg-gray-800/80" />
          <div className="mt-4 h-3 w-24 animate-pulse rounded-md bg-gray-800/60" />
        </div>
      </div>
    );
  }
  if (kind === "command") {
    return (
      <div className="rounded-xl border border-dashed border-amber-500/30 bg-gray-950/95 p-5 shadow-lg shadow-black/20">
        <div className="h-6 w-2/3 animate-pulse rounded-md bg-gray-800" />
        <div className="mt-2 h-4 w-full animate-pulse rounded-md bg-gray-800/80" />
        <div className="mt-4 h-3 w-24 animate-pulse rounded-md bg-gray-800/60" />
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-gray-800 border-l-4 border-l-gray-600 bg-gray-900 p-5 shadow-lg shadow-black/20">
      <div className="h-5 w-20 animate-pulse rounded-full bg-gray-800" />
      <div className="mt-3 h-6 w-3/4 animate-pulse rounded-md bg-gray-800" />
      <div className="mt-2 h-4 w-full animate-pulse rounded-md bg-gray-800/80" />
      <div className="mt-2 h-4 w-5/6 animate-pulse rounded-md bg-gray-800/80" />
      <div className="mt-4 h-3 w-24 animate-pulse rounded-md bg-gray-800/60" />
    </div>
  );
}

function EntityCardSkeletonGrid() {
  const kinds: ("skill" | "agent" | "command")[] = [
    "skill",
    "agent",
    "command",
    "skill",
    "agent",
    "command",
  ];
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {kinds.map((k, i) => (
        <div key={i}>{entityCardSkeleton(k)}</div>
      ))}
    </div>
  );
}

function connectionCountByEntityId(
  entities: GraphEntity[],
  edges: { sourceId: string; targetId: string }[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const e of entities) {
    map.set(e.id, 0);
  }
  for (const edge of edges) {
    map.set(edge.sourceId, (map.get(edge.sourceId) ?? 0) + 1);
    map.set(edge.targetId, (map.get(edge.targetId) ?? 0) + 1);
  }
  return map;
}

export default function DashboardPage() {
  const { data, loading, error: fetchError } = useGraphData();
  const [entityTypeFilter, setEntityTypeFilter] = useState<
    "all" | "skill" | "agent" | "command"
  >("all");
  const [skillCategoryFilter, setSkillCategoryFilter] = useState("all");
  const [agentRoleFilter, setAgentRoleFilter] = useState("all");
  const [selectedEntity, setSelectedEntity] = useState<GraphEntity | null>(
    null,
  );

  const entities = data?.entities;
  const edges = data?.edges;

  const connectionCounts = useMemo(
    () => connectionCountByEntityId(entities ?? [], edges ?? []),
    [entities, edges],
  );

  const filteredEntities = useMemo(() => {
    let list = entities ?? [];

    if (entityTypeFilter !== "all") {
      list = list.filter((e) => e.entityType === entityTypeFilter);
    }

    if (entityTypeFilter === "skill" && skillCategoryFilter !== "all") {
      list = list.filter(
        (e) =>
          e.entityType === "skill" &&
          e.category.trim().toLowerCase() === skillCategoryFilter,
      );
    }

    if (entityTypeFilter === "agent" && agentRoleFilter !== "all") {
      list = list.filter(
        (e) => e.entityType === "agent" && e.role === agentRoleFilter,
      );
    }

    return [...list].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
  }, [entities, entityTypeFilter, skillCategoryFilter, agentRoleFilter]);

  const panelEntities = entities ?? [];
  const panelEdges = edges ?? [];

  const handleClosePanel = useCallback(() => {
    setSelectedEntity(null);
  }, []);

  const emptyMessage = useMemo(() => {
    if (entityTypeFilter === "skill" && skillCategoryFilter !== "all") {
      return "No skills match this category.";
    }
    if (entityTypeFilter === "agent" && agentRoleFilter !== "all") {
      return "No agents match this role.";
    }
    if (entityTypeFilter === "command") {
      return "No commands in the graph.";
    }
    if (entityTypeFilter === "agent") {
      return "No agents in the graph.";
    }
    if (entityTypeFilter === "skill") {
      return "No skills in the graph.";
    }
    return "Nothing matches this filter.";
  }, [entityTypeFilter, skillCategoryFilter, agentRoleFilter]);

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-30 border-b border-gray-800/80 bg-gray-950/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl font-semibold tracking-tight text-white">
              SkillFlow
            </h1>
          </div>

          <nav
            className="mt-4 flex gap-2 border-t border-gray-800/80 pt-3"
            aria-label="Dashboard views"
          >
            <Link
              href="/dashboard"
              className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-950 shadow-md shadow-black/20"
            >
              Cards
            </Link>
            <Link
              href="/dashboard/graph"
              className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-gray-400 border border-gray-800 transition-all duration-200 hover:text-gray-200 hover:border-gray-700"
            >
              Graph
            </Link>
            <Link
              href="/guide"
              className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-gray-400 border border-gray-800 transition-all duration-200 hover:text-gray-200 hover:border-gray-700"
            >
              Guide
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div
          className="-mx-1 flex gap-2 overflow-x-auto pb-2"
          role="tablist"
          aria-label="Entity type"
        >
          {ENTITY_TYPE_TABS.map((tab) => {
            const active = entityTypeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setEntityTypeFilter(tab.id);
                  setSkillCategoryFilter("all");
                  setAgentRoleFilter("all");
                }}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-gray-100 text-gray-950 shadow-md shadow-black/20"
                    : "bg-gray-900 text-gray-400 border border-gray-800 hover:text-gray-200 hover:border-gray-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {entityTypeFilter === "skill" && (
          <div
            className="-mx-1 mt-3 flex gap-2 overflow-x-auto pb-2"
            role="tablist"
            aria-label="Skill category"
          >
            {SKILL_CATEGORY_TABS.map((tab) => {
              const active = skillCategoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSkillCategoryFilter(tab.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-cyan-950/50 text-cyan-200 border border-cyan-800/80"
                      : "bg-gray-900 text-gray-400 border border-gray-800 hover:text-gray-200 hover:border-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {entityTypeFilter === "agent" && (
          <div
            className="-mx-1 mt-3 flex gap-2 overflow-x-auto pb-2"
            role="tablist"
            aria-label="Agent role"
          >
            {AGENT_ROLE_FILTER_TABS.map((tab) => {
              const active = agentRoleFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setAgentRoleFilter(tab.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium capitalize transition-all duration-200 ${
                    active
                      ? "bg-violet-950/40 text-violet-200 border border-violet-800/80"
                      : "bg-gray-900 text-gray-400 border border-gray-800 hover:text-gray-200 hover:border-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {fetchError && !loading && (
          <p className="mb-6 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            {fetchError}
          </p>
        )}

        {loading ? (
          <EntityCardSkeletonGrid />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEntities.map((entity) => (
              <EntityCard
                key={`${entity.entityType}-${entity.id}`}
                entity={entity}
                connectionCount={connectionCounts.get(entity.id) ?? 0}
                onClick={setSelectedEntity}
              />
            ))}
          </div>
        )}

        {!loading && filteredEntities.length === 0 && !fetchError && (
          <p className="mt-8 text-center text-sm text-gray-500">
            {emptyMessage}
          </p>
        )}
      </main>

      <EntityDetailPanel
        entity={selectedEntity}
        edges={panelEdges}
        entities={panelEntities}
        onClose={handleClosePanel}
      />
    </div>
  );
}
