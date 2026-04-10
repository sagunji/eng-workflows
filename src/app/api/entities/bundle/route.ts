import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { zipSync, strToU8 } from "fflate";
import type { EntityType } from "@/types/graph";

const PROJECT_ROOT = process.cwd();

const SKILL_DIR_ALIASES: Record<string, string> = {
  "perf-profiler": "pref-profiler",
};

const TYPE_PLURAL: Record<EntityType, string> = {
  skill: "skills",
  agent: "agents",
  command: "commands",
};

interface ResolvedEntry {
  diskPath: string;
  zipPath: string;
  originalPath: string;
  type: EntityType;
  name: string;
}

function resolveEntry(type: EntityType, name: string): ResolvedEntry | null {
  const safeName = name.replace(/[^a-z0-9_.-]/gi, "");
  if (!safeName) return null;

  let originalPath: string;
  switch (type) {
    case "skill": {
      const dirName = SKILL_DIR_ALIASES[safeName] ?? safeName;
      originalPath = join(".claude", "skills", dirName, "SKILL.md");
      break;
    }
    case "agent":
      originalPath = join(".cursor", "agents", `${safeName}.md`);
      break;
    case "command":
      originalPath = join(".claude", "commands", `${safeName}.md`);
      break;
    default:
      return null;
  }

  const folder = TYPE_PLURAL[type];
  const zipPath = `${folder}/${safeName}.md`;

  return {
    diskPath: join(PROJECT_ROOT, originalPath),
    zipPath,
    originalPath,
    type,
    name: safeName,
  };
}

interface BundleEntry {
  type: EntityType;
  name: string;
}

export async function POST(request: Request) {
  let body: { entities?: BundleEntry[]; zipName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const entries = body.entities;
  if (!Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json(
      { error: "entities array is required" },
      { status: 400 },
    );
  }

  const zipFiles: Record<string, Uint8Array> = {};
  const manifest: { zipPath: string; originalPath: string; type: string; name: string }[] = [];

  await Promise.all(
    entries.map(async ({ type, name }) => {
      const entry = resolveEntry(type, name);
      if (!entry) return;
      try {
        const content = await readFile(entry.diskPath, "utf-8");
        zipFiles[entry.zipPath] = strToU8(content);
        manifest.push({
          zipPath: entry.zipPath,
          originalPath: entry.originalPath,
          type: entry.type,
          name: entry.name,
        });
      } catch {
        // skip missing files
      }
    }),
  );

  if (manifest.length === 0) {
    return NextResponse.json(
      { error: "No files found for the requested entities" },
      { status: 404 },
    );
  }

  zipFiles["manifest.json"] = strToU8(JSON.stringify(manifest, null, 2));

  const zipped = zipSync(zipFiles);
  const safeName = (body.zipName ?? "entity-bundle").replace(/[^a-z0-9_-]/gi, "-");

  return new Response(new Blob([zipped.slice()], { type: "application/zip" }), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${safeName}.zip"`,
    },
  });
}
