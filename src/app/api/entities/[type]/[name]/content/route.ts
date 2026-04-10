import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const PROJECT_ROOT = process.cwd();

const SKILL_NAME_ALIASES: Record<string, string> = {
  "perf-profiler": "pref-profiler",
  "refactor-guide": "refactor-guide.md",
};

function resolveFilePath(type: string, name: string): string | null {
  const safeName = name.replace(/[^a-z0-9_.-]/gi, "");
  if (!safeName) return null;

  switch (type) {
    case "skill": {
      const dirName = SKILL_NAME_ALIASES[safeName] ?? safeName;
      return join(PROJECT_ROOT, ".claude", "skills", dirName, "SKILL.md");
    }
    case "agent":
      return join(PROJECT_ROOT, ".cursor", "agents", `${safeName}.md`);
    case "command":
      return join(PROJECT_ROOT, ".claude", "commands", `${safeName}.md`);
    default:
      return null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string; name: string }> },
) {
  const { type, name } = await params;
  const filePath = resolveFilePath(type, name);

  if (!filePath) {
    return NextResponse.json(
      { error: "Invalid entity type or name" },
      { status: 400 },
    );
  }

  try {
    const content = await readFile(filePath, "utf-8");
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json(
      { error: "Content file not found" },
      { status: 404 },
    );
  }
}
