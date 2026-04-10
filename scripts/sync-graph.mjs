#!/usr/bin/env node

/**
 * Syncs public/graph.json with the actual files in .claude/ and .cursor/.
 *
 * - Adds entities for new files discovered on disk
 * - Removes entities whose source files no longer exist
 * - Prunes edges that reference deleted entities
 * - Preserves manually curated data (descriptions, triggers, roles, edges)
 *
 * Usage:
 *   node scripts/sync-graph.mjs          # sync and write
 *   node scripts/sync-graph.mjs --check  # exit 1 if graph.json is out of date
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, basename } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const GRAPH_PATH = join(ROOT, "public", "graph.json");

const CHECK_MODE = process.argv.includes("--check");

const EXCLUDED_NAMES = new Set([
  "skillflow-doctor",
]);

// ---------------------------------------------------------------------------
// Filesystem discovery
// ---------------------------------------------------------------------------

function discoverSkills() {
  const dir = join(ROOT, ".claude", "skills");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((d) => statSync(join(dir, d)).isDirectory() && existsSync(join(dir, d, "SKILL.md")))
    .map((d) => {
      const path = join(dir, d, "SKILL.md");
      const fm = parseFrontmatter(path);
      return { name: fm.name || d, dirName: d, path, fm };
    });
}

function discoverAgents() {
  const dir = join(ROOT, ".cursor", "agents");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const path = join(dir, f);
      const fm = parseFrontmatter(path);
      return { name: fm.name || basename(f, ".md"), path, fm };
    })
    .filter((a) => !EXCLUDED_NAMES.has(a.name));
}

function discoverCommands() {
  const dir = join(ROOT, ".claude", "commands");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const path = join(dir, f);
      const fm = parseFrontmatter(path);
      return { name: fm.name || basename(f, ".md"), path, fm };
    })
    .filter((c) => !EXCLUDED_NAMES.has(c.name));
}

// ---------------------------------------------------------------------------
// Frontmatter parsing (minimal YAML — handles multiline `>` descriptions)
// ---------------------------------------------------------------------------

function parseFrontmatter(filePath) {
  const raw = readFileSync(filePath, "utf-8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const fm = {};
  let currentKey = null;
  let multiline = false;

  for (const line of match[1].split("\n")) {
    if (!multiline) {
      const kvMatch = line.match(/^(\w[\w.]*)\s*:\s*(.*)$/);
      if (kvMatch) {
        const [, key, value] = kvMatch;
        if (value.trim() === ">" || value.trim() === "|") {
          currentKey = key;
          fm[currentKey] = "";
          multiline = true;
        } else {
          currentKey = key;
          fm[key] = value.trim();
          multiline = false;
        }
      } else if (line.match(/^\s+/) && currentKey) {
        fm[currentKey] = ((fm[currentKey] || "") + " " + line.trim()).trim();
      }
    } else {
      if (line.match(/^\S/) && !line.match(/^\s*$/)) {
        const kvMatch = line.match(/^(\w[\w.]*)\s*:\s*(.*)$/);
        if (kvMatch) {
          multiline = false;
          currentKey = kvMatch[1];
          fm[currentKey] = kvMatch[2].trim();
          if (fm[currentKey] === ">" || fm[currentKey] === "|") {
            fm[currentKey] = "";
            multiline = true;
          }
        }
      } else {
        fm[currentKey] = ((fm[currentKey] || "") + " " + line.trim()).trim();
      }
    }
  }

  return fm;
}

// ---------------------------------------------------------------------------
// Entity ID conventions
// ---------------------------------------------------------------------------

function skillId(name) { return `skill-${name}`; }
function agentId(name) { return `agent-${name}`; }
function cmdId(name) { return `cmd-${name}`; }

// ---------------------------------------------------------------------------
// Extract a one-line description from frontmatter
// ---------------------------------------------------------------------------

function extractDescription(fm) {
  const desc = fm.description || "";
  const firstSentence = desc.split(/\.\s+Use\s+when/i)[0];
  const cleaned = firstSentence.split(/\.\s+Does\s+NOT/i)[0];
  return (cleaned || desc).replace(/\s+/g, " ").trim().replace(/\.$/, "");
}

// ---------------------------------------------------------------------------
// Build stub entities for new files
// ---------------------------------------------------------------------------

function stubSkill(name, fm) {
  const entity = {
    id: skillId(name),
    entityType: "skill",
    name,
    description: extractDescription(fm),
    triggers: [],
    category: "uncategorized",
  };

  const rawCat = fm["metadata"] || "";
  if (rawCat) {
    const catMatch = rawCat.match(/category:\s*(\S+)/);
    if (catMatch) entity.category = catMatch[1];
  }

  return entity;
}

function stubAgent(name, fm) {
  return {
    id: agentId(name),
    entityType: "agent",
    name,
    description: extractDescription(fm),
    role: "uncategorized",
  };
}

function stubCommand(name, fm) {
  return {
    id: cmdId(name),
    entityType: "command",
    name,
    description: extractDescription(fm),
    triggers: [],
  };
}

// ---------------------------------------------------------------------------
// Main sync
// ---------------------------------------------------------------------------

const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));
const existingById = new Map(graph.entities.map((e) => [e.id, e]));

const diskSkills = discoverSkills();
const diskAgents = discoverAgents();
const diskCommands = discoverCommands();

const diskIds = new Set([
  ...diskSkills.map((s) => skillId(s.name)),
  ...diskAgents.map((a) => agentId(a.name)),
  ...diskCommands.map((c) => cmdId(c.name)),
]);

const added = [];
const removed = [];

for (const s of diskSkills) {
  const id = skillId(s.name);
  if (!existingById.has(id)) {
    const entity = stubSkill(s.name, s.fm);
    graph.entities.push(entity);
    added.push(id);
  }
}

for (const a of diskAgents) {
  const id = agentId(a.name);
  if (!existingById.has(id)) {
    const entity = stubAgent(a.name, a.fm);
    graph.entities.push(entity);
    added.push(id);
  }
}

for (const c of diskCommands) {
  const id = cmdId(c.name);
  if (!existingById.has(id)) {
    const entity = stubCommand(c.name, c.fm);
    graph.entities.push(entity);
    added.push(id);
  }
}

const beforeCount = graph.entities.length;
graph.entities = graph.entities.filter((e) => {
  if (!diskIds.has(e.id)) {
    removed.push(e.id);
    return false;
  }
  return true;
});

const removedSet = new Set(removed);
const edgesBefore = graph.edges.length;
graph.edges = graph.edges.filter(
  (e) => !removedSet.has(e.sourceId) && !removedSet.has(e.targetId),
);
const edgesPruned = edgesBefore - graph.edges.length;

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

const changed = added.length > 0 || removed.length > 0;

if (added.length > 0) {
  console.log(`\n✚ Added ${added.length} entities:`);
  for (const id of added) console.log(`  + ${id}`);
}
if (removed.length > 0) {
  console.log(`\n✖ Removed ${removed.length} entities:`);
  for (const id of removed) console.log(`  - ${id}`);
  if (edgesPruned > 0) {
    console.log(`  (pruned ${edgesPruned} orphaned edges)`);
  }
}
if (!changed) {
  console.log("✓ graph.json is in sync with .claude/ and .cursor/");
}

if (CHECK_MODE) {
  process.exit(changed ? 1 : 0);
}

if (changed) {
  const sorted = JSON.stringify(graph, null, 2) + "\n";
  writeFileSync(GRAPH_PATH, sorted, "utf-8");
  console.log(`\n✓ Wrote ${GRAPH_PATH}`);
  if (added.length > 0) {
    console.log("\n⚠ New entities have placeholder values for triggers/category/role.");
    console.log("  Edit public/graph.json to fill in curated metadata.");
  }
}
