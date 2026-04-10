"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { SkillGraph, type GraphFilter } from "@/components/skill-graph";
import { EntityDetailPanel } from "@/components/entity-detail-panel";
import { useGraphData } from "@/hooks/use-graph-data";
import type { EntityType, GraphEntity } from "@/types/graph";

export default function GraphPage() {
  const { data: graphData, loading, error: fetchError } = useGraphData();
  const [selectedEntity, setSelectedEntity] = useState<GraphEntity | null>(
    null,
  );
  const [showSkills, setShowSkills] = useState(true);
  const [showAgents, setShowAgents] = useState(true);
  const [showCommands, setShowCommands] = useState(true);
  const [focusEntityId, setFocusEntityId] = useState("");

  const graphFilter = useMemo<GraphFilter | undefined>(() => {
    const entityTypes = new Set<EntityType>();
    if (showSkills) entityTypes.add("skill");
    if (showAgents) entityTypes.add("agent");
    if (showCommands) entityTypes.add("command");
    const allTypesOn = showSkills && showAgents && showCommands;
    const focus = focusEntityId.trim() || undefined;
    if (allTypesOn && !focus) return undefined;
    return {
      entityTypes,
      focusEntity: focus,
    };
  }, [showSkills, showAgents, showCommands, focusEntityId]);

  const toggleEntityType = useCallback(
    (type: EntityType) => {
      const nextSkills = type === "skill" ? !showSkills : showSkills;
      const nextAgents = type === "agent" ? !showAgents : showAgents;
      const nextCommands = type === "command" ? !showCommands : showCommands;
      if (!nextSkills && !nextAgents && !nextCommands) return;
      setShowSkills(nextSkills);
      setShowAgents(nextAgents);
      setShowCommands(nextCommands);
    },
    [showSkills, showAgents, showCommands],
  );

  const focusGroups = useMemo(() => {
    if (!graphData) {
      return { agents: [] as GraphEntity[], commands: [] as GraphEntity[] };
    }
    const agents = graphData.entities.filter((e) => e.entityType === "agent");
    const commands = graphData.entities.filter(
      (e) => e.entityType === "command",
    );
    agents.sort((a, b) => a.name.localeCompare(b.name));
    commands.sort((a, b) => a.name.localeCompare(b.name));
    return { agents, commands };
  }, [graphData]);

  const handleClosePanel = useCallback(() => {
    setSelectedEntity(null);
  }, []);

  const counts = graphData
    ? {
        skills: graphData.entities.filter((e) => e.entityType === "skill")
          .length,
        agents: graphData.entities.filter((e) => e.entityType === "agent")
          .length,
        commands: graphData.entities.filter((e) => e.entityType === "command")
          .length,
      }
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="z-30 shrink-0 border-b border-gray-800/80 bg-gray-950/90 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-white">
              SkillFlow
            </h1>
            {counts && (
              <div className="hidden items-center gap-2 sm:flex">
                <span className="rounded-full bg-gray-800/60 px-2 py-0.5 text-[11px] font-medium text-gray-400">
                  {counts.skills} skills
                </span>
                <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[11px] font-medium text-violet-300">
                  {counts.agents} agents
                </span>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                  {counts.commands} commands
                </span>
              </div>
            )}
          </div>
          <nav className="flex gap-2" aria-label="Dashboard views">
            <Link
              href="/dashboard"
              className="rounded-full bg-gray-900 px-4 py-1.5 text-sm font-medium text-gray-400 border border-gray-800 transition-all duration-200 hover:text-gray-200 hover:border-gray-700"
            >
              Cards
            </Link>
            <Link
              href="/dashboard/graph"
              className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-950 shadow-md shadow-black/20"
            >
              Graph
            </Link>
            <Link
              href="/guide"
              className="rounded-full bg-gray-900 px-4 py-1.5 text-sm font-medium text-gray-400 border border-gray-800 transition-all duration-200 hover:text-gray-200 hover:border-gray-700"
            >
              Guide
            </Link>
          </nav>
        </div>
      </header>

      <div className="relative flex flex-1">
        {/* ── Left sidebar: filters ── */}
        <aside className="z-20 flex w-48 shrink-0 flex-col gap-3 border-r border-gray-800/80 bg-gray-950/95 px-3 py-4 backdrop-blur-md">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
              Show
            </span>
            <button
              type="button"
              onClick={() => toggleEntityType("skill")}
              aria-pressed={showSkills}
              className={`w-full rounded-lg px-3 py-1.5 text-left text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 ${
                showSkills
                  ? "bg-gray-100 text-gray-950 shadow-sm"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              Skills
            </button>
            <button
              type="button"
              onClick={() => toggleEntityType("agent")}
              aria-pressed={showAgents}
              className={`w-full rounded-lg px-3 py-1.5 text-left text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 ${
                showAgents
                  ? "bg-violet-500/25 text-violet-100 border border-violet-400/50 shadow-sm"
                  : "text-gray-400 hover:bg-gray-800 hover:text-violet-200"
              }`}
            >
              Agents
            </button>
            <button
              type="button"
              onClick={() => toggleEntityType("command")}
              aria-pressed={showCommands}
              className={`w-full rounded-lg px-3 py-1.5 text-left text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 ${
                showCommands
                  ? "bg-amber-500/20 text-amber-100 border border-amber-400/45 shadow-sm"
                  : "text-gray-400 hover:bg-gray-800 hover:text-amber-200"
              }`}
            >
              Commands
            </button>
          </div>

          <div className="h-px bg-gray-800/80" />

          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
              Focus
            </span>
            <select
              value={focusEntityId}
              onChange={(e) => setFocusEntityId(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-2 py-1.5 text-xs text-gray-200 shadow-inner focus:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            >
              <option value="">Show all</option>
              <optgroup label="Agents">
                {focusGroups.agents.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Commands">
                {focusGroups.commands.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>

          <div className="mt-auto flex flex-col gap-1.5 border-t border-gray-800/80 pt-3 text-[11px] text-gray-500">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm border border-gray-600 bg-gray-700" />
              <span className="text-gray-400">Skill</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500" />
              <span className="text-gray-400">Agent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-amber-500/60 bg-amber-500/20" />
              <span className="text-gray-400">Command</span>
            </div>
            <div className="mt-1 text-[10px] text-gray-600">
              Drag nodes to rearrange
            </div>
          </div>
        </aside>

        {/* ── Graph area ── */}
        <div className="relative flex-1">
          {fetchError && !loading && (
            <p className="absolute left-1/2 top-4 z-20 w-[min(100%-2rem,36rem)] -translate-x-1/2 rounded-lg border border-red-900/50 bg-red-950/90 px-4 py-3 text-center text-sm text-red-300 backdrop-blur-sm">
              {fetchError}
            </p>
          )}

          {loading || !graphData ? (
            <div className="flex h-full min-h-[320px] items-center justify-center bg-gray-950">
              <div
                className="h-10 w-10 animate-spin rounded-full border-2 border-gray-700 border-t-cyan-500"
                role="status"
                aria-label="Loading graph"
              />
            </div>
          ) : (
            <SkillGraph
              data={graphData}
              filter={graphFilter}
              onNodeClick={setSelectedEntity}
            />
          )}
        </div>
      </div>

      {graphData && (
        <EntityDetailPanel
          entity={selectedEntity}
          edges={graphData.edges}
          entities={graphData.entities}
          onClose={handleClosePanel}
        />
      )}
    </div>
  );
}
