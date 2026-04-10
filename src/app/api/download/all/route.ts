import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { zipSync, strToU8 } from "fflate";

function rootJoin(...segments: string[]): string {
  return join(/*turbopackIgnore: true*/ process.cwd(), ...segments);
}

const DIRS_TO_BUNDLE = [".claude", ".cursor"];

async function walkDir(dir: string): Promise<{ path: string; content: string }[]> {
  const results: { path: string; content: string }[] = [];

  async function walk(current: string) {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdc")) {
        const content = await readFile(fullPath, "utf-8");
        const rel = relative(rootJoin(), fullPath);
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

Then run \`/skillflow-doctor\` to verify everything is connected.

## What's inside

- **claude/skills/** — skills that trigger from natural language
- **claude/commands/** — slash commands for structured workflows
- **cursor/agents/** — specialist agent roles

See INSTALL.md for detailed setup instructions.

Learn more: https://github.com/sagunji/eng-workflows
`;


export async function GET() {
  const allFiles = (await Promise.all(DIRS_TO_BUNDLE.map((d) => walkDir(rootJoin(d))))).flat();

  if (allFiles.length === 0) {
    return new Response("No workflow files found", { status: 404 });
  }

  const zipFiles: Record<string, Uint8Array> = {};
  for (const file of allFiles) {
    const visiblePath = file.path.replace(/^\.claude\//, "claude/").replace(/^\.cursor\//, "cursor/");
    zipFiles[visiblePath] = strToU8(file.content);
  }
  zipFiles["README.md"] = strToU8(SETUP_README);

  try {
    const installMd = await readFile(rootJoin("INSTALL.md"), "utf-8");
    zipFiles["INSTALL.md"] = strToU8(installMd);
  } catch {
    // INSTALL.md not found — skip
  }

  const zipped = zipSync(zipFiles);

  return new Response(new Blob([zipped.slice()], { type: "application/zip" }), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="eng-workflows.zip"',
    },
  });
}
