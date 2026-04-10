import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

function rootJoin(...segments: string[]): string {
  return join(/*turbopackIgnore: true*/ process.cwd(), ...segments);
}

const SKILL_NAME_ALIASES: Record<string, string> = {
  "refactor-guide": "refactor-guide.md",
};

function resolveRelativePath(type: string, name: string): string | null {
  const safeName = name.replace(/[^a-z0-9_.-]/gi, "");
  if (!safeName) return null;

  switch (type) {
    case "skill": {
      const dirName = SKILL_NAME_ALIASES[safeName] ?? safeName;
      return join(".claude", "skills", dirName, "SKILL.md");
    }
    case "agent":
      return join(".cursor", "agents", `${safeName}.md`);
    case "command":
      return join(".claude", "commands", `${safeName}.md`);
    default:
      return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string; name: string }> },
) {
  const { type, name } = await params;
  const relativePath = resolveRelativePath(type, name);

  if (!relativePath) {
    return NextResponse.json(
      { error: "Invalid entity type or name" },
      { status: 400 },
    );
  }

  const url = new URL(request.url);
  const raw = url.searchParams.get("raw") === "1";

  try {
    const fileContent = await readFile(rootJoin(relativePath), "utf-8");
    const content = raw
      ? fileContent
      : fileContent.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");

    return NextResponse.json({ content, path: relativePath });
  } catch {
    return NextResponse.json(
      { error: "Content file not found" },
      { status: 404 },
    );
  }
}
