"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { EntityCard, AGENT_ROLE_FILTER_TABS } from "@/components/entity-card";
import { EntityDetailPanel } from "@/components/entity-detail-panel";
import { SiteFooter } from "@/components/site-footer";
import { useGraphData } from "@/hooks/use-graph-data";
import type { GraphEntity } from "@/types/graph";

const GITHUB_URL = "https://github.com/sagunji/eng-workflows";

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
  { id: "architecture", label: "Architecture" },
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
            <Link href="/" className="text-xl font-semibold tracking-tight text-white hover:text-gray-200 transition-colors">
              SkillFlow
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              aria-label="View source on GitHub"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
              </svg>
              <span className="hidden sm:inline">Source</span>
            </a>
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
        <div className="mb-6 rounded-xl border border-gray-800/80 bg-gray-900/40 px-4 py-3">
          <p className="text-sm leading-relaxed text-gray-400">
            You&apos;re exploring the live workflow graph from the{" "}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-200 underline decoration-gray-600 underline-offset-2 transition-colors hover:text-white hover:decoration-gray-400"
            >
              eng-workflows
            </a>{" "}
            project. Each card is an actual skill, agent, or command defined in the repo&apos;s{" "}
            <code className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-300">.claude/</code>{" "}
            and{" "}
            <code className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-300">.cursor/</code>{" "}
            directories. Click any card to read its source and download it.
          </p>
        </div>

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

      <SiteFooter />

      <EntityDetailPanel
        entity={selectedEntity}
        edges={panelEdges}
        entities={panelEntities}
        onClose={handleClosePanel}
      />
    </div>
  );
}
