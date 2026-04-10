"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { GraphEntity, GraphEdge, EntityType } from "@/types/graph";
import { useEntityContent } from "@/hooks/use-entity-content";

export interface EntityDetailPanelProps {
  entity: GraphEntity | null;
  edges: GraphEdge[];
  entities: GraphEntity[];
  onClose: () => void;
}

const TYPE_BADGE: Record<string, { classes: string; label: string }> = {
  skill: { classes: "bg-gray-700/50 text-gray-300 border border-gray-600", label: "Skill" },
  agent: { classes: "bg-violet-500/20 text-violet-300 border border-violet-500/30", label: "Agent" },
  command: { classes: "bg-amber-500/20 text-amber-300 border border-amber-500/30", label: "Command" },
};

export type DownloadScope = "single" | "incoming" | "outgoing" | "all";

const DOWNLOAD_SCOPE_OPTIONS: { value: DownloadScope; label: string; description: string }[] = [
  { value: "single", label: "This entity only", description: "Download just this file" },
  { value: "incoming", label: "Include \"Connected from\"", description: "Add predecessors" },
  { value: "outgoing", label: "Include \"Connects to\"", description: "Add successors" },
  { value: "all", label: "All connections", description: "Predecessors + successors" },
];

async function fetchEntityMarkdown(
  type: EntityType,
  name: string,
): Promise<{ name: string; type: EntityType; content: string } | null> {
  try {
    const res = await fetch(`/api/entities/${type}/${encodeURIComponent(name)}/content`);
    if (!res.ok) return null;
    const json = await res.json();
    const raw: string = json.content ?? "";
    const stripped = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
    return { name, type, content: stripped };
  } catch {
    return null;
  }
}

function bundleMarkdown(
  primary: { name: string; type: EntityType; content: string },
  connected: { name: string; type: EntityType; content: string | null }[],
): string {
  const sections = [`# ${primary.name} (${primary.type})\n\n${primary.content}`];

  for (const c of connected) {
    if (c.content) {
      sections.push(`# ${c.name} (${c.type})\n\n${c.content}`);
    } else {
      sections.push(`# ${c.name} (${c.type})\n\n> Content not available for ${c.name}.`);
    }
  }

  return sections.join("\n\n---\n\n");
}

function triggerDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

type Tab = "content" | "connections";

export function EntityDetailPanel({ entity, edges, entities, onClose }: EntityDetailPanelProps) {
  const [entered, setEntered] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("content");
  const [copied, setCopied] = useState(false);
  const copyFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showDownloadPopover, setShowDownloadPopover] = useState(false);
  const [downloadScope, setDownloadScope] = useState<DownloadScope>("single");
  const [downloading, setDownloading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const { content, loading: contentLoading, error: contentError } = useEntityContent(
    entity?.entityType ?? null,
    entity?.name ?? null,
  );

  useEffect(() => {
    if (!entity) return;
    setEntered(false);
    setActiveTab("content");
    setCopied(false);
    setShowDownloadPopover(false);
    setDownloadScope("single");
    setDownloading(false);
    if (copyFeedbackTimeoutRef.current !== null) {
      clearTimeout(copyFeedbackTimeoutRef.current);
      copyFeedbackTimeoutRef.current = null;
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, [entity?.id]);

  useEffect(() => {
    return () => {
      if (copyFeedbackTimeoutRef.current !== null) {
        clearTimeout(copyFeedbackTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!showDownloadPopover) return;
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowDownloadPopover(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setShowDownloadPopover(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showDownloadPopover]);

  if (!entity) return null;

  const entityById = new Map(entities.map((e) => [e.id, e]));
  const entityNameById = new Map(entities.map((e) => [e.id, e.name]));
  const outgoing = edges.filter((e) => e.sourceId === entity.id);
  const incoming = edges.filter((e) => e.targetId === entity.id);
  const badge = TYPE_BADGE[entity.entityType] ?? TYPE_BADGE.skill;
  const connectionCount = outgoing.length + incoming.length;

  const subtitle =
    entity.entityType === "agent" ? entity.role :
    entity.entityType === "skill" ? entity.category :
    null;

  const canShowContentActions =
    Boolean(content) && !contentLoading && !contentError;

  async function handleCopyMarkdown(): Promise<void> {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      if (copyFeedbackTimeoutRef.current !== null) {
        clearTimeout(copyFeedbackTimeoutRef.current);
      }
      copyFeedbackTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        copyFeedbackTimeoutRef.current = null;
      }, 2000);
    } catch {}
  }

  async function handleDownloadConfirm(): Promise<void> {
    if (!content || !entity) return;

    if (downloadScope === "single") {
      triggerDownload(content, `${entity.name}.md`);
      setShowDownloadPopover(false);
      return;
    }

    setDownloading(true);

    const connectedEntities: GraphEntity[] = [];
    const seen = new Set<string>();

    if (downloadScope === "incoming" || downloadScope === "all") {
      for (const edge of incoming) {
        const e = entityById.get(edge.sourceId);
        if (e && !seen.has(e.id)) {
          seen.add(e.id);
          connectedEntities.push(e);
        }
      }
    }
    if (downloadScope === "outgoing" || downloadScope === "all") {
      for (const edge of outgoing) {
        const e = entityById.get(edge.targetId);
        if (e && !seen.has(e.id)) {
          seen.add(e.id);
          connectedEntities.push(e);
        }
      }
    }

    const results = await Promise.all(
      connectedEntities.map((e) => fetchEntityMarkdown(e.entityType, e.name)),
    );

    const connected = connectedEntities.map((e, i) => ({
      name: e.name,
      type: e.entityType,
      content: results[i]?.content ?? null,
    }));

    const bundled = bundleMarkdown(
      { name: entity.name, type: entity.entityType, content },
      connected,
    );

    const filename = connected.length > 0 ? `${entity.name}-bundle.md` : `${entity.name}.md`;
    triggerDownload(bundled, filename);

    setDownloading(false);
    setShowDownloadPopover(false);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close panel"
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[3px] transition-opacity duration-300 ease-out ${
          entered ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col border-l border-gray-800 bg-gray-900 shadow-2xl shadow-black/50 transition-transform duration-300 ease-out ${
          entered ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="entity-detail-title"
      >
        {/* Header */}
        <header className="shrink-0 border-b border-gray-800 px-6 pt-5 pb-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.classes}`}>
                  {badge.label}
                </span>
                {subtitle && (
                  <span className="inline-block rounded-full bg-gray-800/60 px-2.5 py-0.5 text-xs font-medium capitalize text-gray-400 border border-gray-700/60">
                    {subtitle}
                  </span>
                )}
              </div>
              <h2 id="entity-detail-title" className="mt-2 text-xl font-semibold text-white">
                {entity.entityType === "command" ? `/${entity.name}` : entity.name}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-400">{entity.description}</p>
            </div>
            <div className="flex shrink-0 items-start gap-1">
              {canShowContentActions && (
                <div className="flex items-center gap-1" role="group" aria-label="Content actions">
                  <button
                    type="button"
                    onClick={() => {
                      void handleCopyMarkdown();
                    }}
                    className={`flex h-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 ${
                      copied ? "min-w-[4.75rem] px-2 text-xs font-medium text-white" : "w-9"
                    }`}
                    aria-label={copied ? "Copied" : "Copy markdown to clipboard"}
                  >
                    {copied ? (
                      "Copied!"
                    ) : (
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                  <div className="relative" ref={popoverRef}>
                    <button
                      type="button"
                      onClick={() => setShowDownloadPopover((v) => !v)}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 ${
                        showDownloadPopover
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`}
                      aria-label="Download markdown file"
                      aria-expanded={showDownloadPopover}
                      aria-haspopup="dialog"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>

                    {showDownloadPopover && (
                      <div
                        className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-gray-700 bg-gray-900 p-4 shadow-2xl shadow-black/50"
                        role="dialog"
                        aria-label="Download options"
                      >
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                          Download scope
                        </p>
                        <fieldset className="mt-3 space-y-1" disabled={downloading}>
                          {DOWNLOAD_SCOPE_OPTIONS.map((opt) => {
                            const disabled =
                              (opt.value === "incoming" && incoming.length === 0) ||
                              (opt.value === "outgoing" && outgoing.length === 0) ||
                              (opt.value === "all" && connectionCount === 0);
                            return (
                              <label
                                key={opt.value}
                                className={`flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 transition-colors ${
                                  disabled
                                    ? "cursor-not-allowed opacity-40"
                                    : downloadScope === opt.value
                                      ? "bg-gray-800"
                                      : "hover:bg-gray-800/50"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="download-scope"
                                  value={opt.value}
                                  checked={downloadScope === opt.value}
                                  disabled={disabled}
                                  onChange={() => setDownloadScope(opt.value)}
                                  className="mt-0.5 h-4 w-4 shrink-0 accent-cyan-500"
                                />
                                <span>
                                  <span className="block text-sm font-medium text-gray-200">
                                    {opt.label}
                                    {opt.value === "incoming" && incoming.length > 0 && (
                                      <span className="ml-1.5 text-xs text-gray-500">({incoming.length})</span>
                                    )}
                                    {opt.value === "outgoing" && outgoing.length > 0 && (
                                      <span className="ml-1.5 text-xs text-gray-500">({outgoing.length})</span>
                                    )}
                                    {opt.value === "all" && connectionCount > 0 && (
                                      <span className="ml-1.5 text-xs text-gray-500">({connectionCount})</span>
                                    )}
                                  </span>
                                  <span className="block text-xs text-gray-500">{opt.description}</span>
                                </span>
                              </label>
                            );
                          })}
                        </fieldset>
                        <button
                          type="button"
                          disabled={downloading}
                          onClick={() => { void handleDownloadConfirm(); }}
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 disabled:opacity-50"
                        >
                          {downloading ? (
                            <>
                              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                              Fetching…
                            </>
                          ) : (
                            "Download"
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60"
                aria-label="Close"
              >
                <span className="text-xl leading-none" aria-hidden>×</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <nav className="mt-4 flex gap-1" aria-label="Panel tabs">
            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "content"
                  ? "bg-gray-950 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Content
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("connections")}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "connections"
                  ? "bg-gray-950 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Connections
              {connectionCount > 0 && (
                <span className="ml-1.5 inline-block rounded-full bg-gray-800 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
                  {connectionCount}
                </span>
              )}
            </button>
          </nav>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-gray-950 p-6">
          {activeTab === "content" && (
            <div>
              {contentLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-700 border-t-cyan-500" />
                  Loading content…
                </div>
              )}
              {contentError && !contentLoading && (
                <p className="rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 text-sm text-gray-500">
                  No source file found for this entity.
                </p>
              )}
              {content && !contentLoading && (
                <article className="prose-dark">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                </article>
              )}
            </div>
          )}

          {activeTab === "connections" && (
            <div className="space-y-6">
              {outgoing.length > 0 && (
                <section>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Connects to ({outgoing.length})
                  </h3>
                  <ul className="mt-2.5 space-y-1.5">
                    {outgoing.map((e) => (
                      <li key={e.id} className="rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2 text-sm">
                        <span className="font-medium text-gray-200">{e.label}</span>
                        <span className="mt-0.5 block text-xs text-gray-500">
                          → {entityNameById.get(e.targetId) ?? e.targetId}
                          <span className="ml-1.5 text-gray-600">({e.targetType})</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {incoming.length > 0 && (
                <section>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Connected from ({incoming.length})
                  </h3>
                  <ul className="mt-2.5 space-y-1.5">
                    {incoming.map((e) => (
                      <li key={e.id} className="rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2 text-sm">
                        <span className="font-medium text-gray-200">{e.label}</span>
                        <span className="mt-0.5 block text-xs text-gray-500">
                          ← {entityNameById.get(e.sourceId) ?? e.sourceId}
                          <span className="ml-1.5 text-gray-600">({e.sourceType})</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {connectionCount === 0 && (
                <p className="text-sm text-gray-500">No connections.</p>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
