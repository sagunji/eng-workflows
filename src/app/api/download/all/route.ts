import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { zipSync, strToU8 } from "fflate";

const PROJECT_ROOT = process.cwd();

const DIRS_TO_BUNDLE = [
  join(PROJECT_ROOT, ".claude"),
  join(PROJECT_ROOT, ".cursor"),
];

async function walkDir(dir: string): Promise<{ path: string; content: string }[]> {
  const results: { path: string; content: string }[] = [];

  async function walk(current: string) {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.name.endsWith(".md")) {
        const content = await readFile(fullPath, "utf-8");
        const rel = relative(PROJECT_ROOT, fullPath);
        results.push({ path: rel, content });
      }
    }
  }

  try {
    await walk(dir);
  } catch {
    // directory doesn't exist — skip
  }

  return results;
}

const SETUP_README = `# eng-workflows

These are AI-powered engineering workflows for Claude and Cursor.

## Setup

Copy the two directories into your project root:

    cp -r claude/ your-project/.claude/
    cp -r cursor/ your-project/.cursor/

Note: the directories must be named \`.claude/\` and \`.cursor/\`
(with the leading dot) in your project for the tools to detect them.

## What's inside

- **claude/skills/** — 14 skills that trigger from natural language
- **claude/commands/** — 7 slash commands for structured workflows  
- **cursor/agents/** — 14 specialist agent roles

Learn more: https://github.com/sagunji/eng-workflows
`;


export async function GET() {
  const allFiles = (await Promise.all(DIRS_TO_BUNDLE.map(walkDir))).flat();

  if (allFiles.length === 0) {
    return new Response("No workflow files found", { status: 404 });
  }

  const zipFiles: Record<string, Uint8Array> = {};
  for (const file of allFiles) {
    const visiblePath = file.path.replace(/^\.claude\//, "claude/").replace(/^\.cursor\//, "cursor/");
    zipFiles[visiblePath] = strToU8(file.content);
  }
  zipFiles["README.md"] = strToU8(SETUP_README);

  const zipped = zipSync(zipFiles);

  return new Response(new Blob([zipped.slice()], { type: "application/zip" }), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="eng-workflows.zip"',
    },
  });
}
