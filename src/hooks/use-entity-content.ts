"use client";

import { useEffect, useState } from "react";
import type { EntityType } from "@/types/graph";

interface UseEntityContentResult {
  content: string | null;
  loading: boolean;
  error: string | null;
}

/** Strip YAML frontmatter (--- ... ---) from the start of a markdown string. */
function stripFrontmatter(md: string): string {
  const match = md.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? md.slice(match[0].length) : md;
}

export function useEntityContent(
  entityType: EntityType | null,
  entityName: string | null,
): UseEntityContentResult {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entityType || !entityName) {
      setContent(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/entities/${entityType}/${encodeURIComponent(entityName)}/content`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Not found (${res.status})`);
        const json = await res.json();
        if (!cancelled) setContent(stripFrontmatter(json.content));
      })
      .catch((err) => {
        if (!cancelled) {
          setContent(null);
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [entityType, entityName]);

  return { content, loading, error };
}
