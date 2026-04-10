"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { SkillGraph, type GraphFilter } from "@/components/skill-graph";
import { EntityDetailPanel } from "@/components/entity-detail-panel";
import { useGraphData } from "@/hooks/use-graph-data";
import type { EntityType, GraphEntity } from "@/types/graph";

const GITHUB_URL = "https://github.com/sagunji/eng-workflows";

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
            <Link href="/" className="text-xl font-semibold tracking-tight text-white hover:text-gray-200 transition-colors">
              SkillFlow
            </Link>
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
          <nav className="flex items-center gap-2" aria-label="Dashboard views">
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
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              aria-label="View source on GitHub"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
              </svg>
            </a>
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
              Hover nodes to reveal edges
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
              selectedEntityId={selectedEntity?.id ?? null}
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
