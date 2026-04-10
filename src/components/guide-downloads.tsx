"use client";

import { useState } from "react";
import type { EntityType } from "@/types/graph";

interface BundleEntity {
  type: EntityType;
  name: string;
}

interface RecipeDownloadProps {
  label: string;
  entities: BundleEntity[];
  zipName: string;
}

async function downloadBundle(entities: BundleEntity[], zipName: string) {
  const res = await fetch("/api/entities/bundle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entities, zipName }),
  });
  if (!res.ok) throw new Error("Bundle request failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${zipName}.zip`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function downloadAll() {
  const res = await fetch("/api/download/all");
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "eng-workflows.zip";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function DownloadAllButton() {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await downloadAll();
        } catch {
          // silent
        } finally {
          setLoading(false);
        }
      }}
      className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 shadow-lg shadow-white/10 transition-all hover:bg-gray-100 disabled:opacity-50"
    >
      {loading ? (
        <>
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-gray-950" />
          Preparing…
        </>
      ) : (
        <>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download all workflows
        </>
      )}
    </button>
  );
}

export function RecipeDownloadButton({ label, entities, zipName }: RecipeDownloadProps) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await downloadBundle(entities, zipName);
        } catch {
          // silent
        } finally {
          setLoading(false);
        }
      }}
      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-2 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white disabled:opacity-50"
    >
      {loading ? (
        <>
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-600 border-t-gray-300" />
          Preparing…
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
