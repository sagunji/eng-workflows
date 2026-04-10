# SkillFlow — project context

> **Audience:** Human developers and AI assistants orienting in this codebase.  
> **Last reviewed:** 2026-04-09 (aligned with repo state and `docs/adr/ADR-002`.)

---

## Purpose

**SkillFlow** is an interactive developer workflow dashboard. It visualizes AI-oriented **skills**, **Cursor agents**, and **slash commands** as a **draggable node graph** and as **filterable cards**, so you can see how entities connect and open their source markdown.

High-level flow:

1. **Graph data** loads from a static file (`public/graph.json`) — entities and directed edges.
2. **UI** renders either a **card grid** (`/dashboard`) or a **React Flow graph** (`/dashboard/graph`).
3. **Detail panel** fetches full markdown for a selected entity via a **single API route** that reads files from the repo (`.claude/skills/`, `.cursor/agents/`, `.claude/commands/`).

There is **no database or auth in the running app** (see [Data & persistence](#data--persistence)).

---

## Architecture

| Layer | Responsibility |
|--------|------------------|
| **Next.js App Router** | Routes, layouts, metadata; one Route Handler for markdown. |
| **Client components** | Dashboard, graph, panels, hooks (`"use client"` where needed). |
| **Static asset** | `graph.json` — canonical graph structure for the UI. |
| **Filesystem** | Live `.md` content for the detail panel (paths resolved from repo root). |

**Path alias:** `@/*` → `src/*` (`tsconfig.json`).

The content API uses `process.cwd()` to read `.claude/` and `.cursor/` markdown files from the project root.

---

## Tech stack (actual `package.json`)

| Area | Choice | Notes |
|------|--------|--------|
| Framework | **Next.js 16** (`next` 16.2.3) | **App Router.** Older docs/ADRs mention Next 14; upgrade accordingly when reading training data. |
| UI | **React 19** | `react` / `react-dom` 19.2.x |
| Language | **TypeScript 5** | `strict`, path alias `@/`. |
| Styling | **Tailwind CSS 4** | `@import "tailwindcss"` in `src/app/globals.css`, `@tailwindcss/postcss`. |
| Graph UI | **`@xyflow/react` ^12** | React Flow v12 package name. |
| Layout | **ELK** (`elkjs`) | Initial graph layout (`stress` algorithm) in `src/lib/graph-layout.ts`. |
| Physics / drag refinement | **`d3-force`** | `use-force-layout.ts` — simulation on drag and after ELK positions nodes. |
| Markdown in panel | **`react-markdown`** + **`remark-gfm`** | Entity detail “Content” tab. |
| Tests | **Vitest 4** + **Testing Library** + **jsdom** | `vitest.config.ts`, `src/**/*.test.{ts,tsx}`. *(No `test` script in `package.json`; run e.g. `npx vitest`.)* |
| ORM / DB (schema only) | **Prisma** schema + **PostgreSQL** | **Not installed or used at runtime** in this branch — see below. |

---

## Directory structure (high signal)

```
full-stack-dev/
├── .claude/                  # Skills + commands (read by content API)
│   ├── skills/
│   └── commands/
├── .cursor/                  # Cursor agents (read by content API)
│   └── agents/
├── AGENTS.md                 # Next.js agent rules (breaking changes notice)
├── CONTEXT.md                # This file
├── README.md                 # Project overview
├── next.config.ts
├── package.json
├── public/
│   └── graph.json            # Entities + edges for the UI
├── docs/                     # ADRs, reviews, project plan
└── src/
    ├── app/
    │   ├── layout.tsx        # Root layout, fonts, metadata
    │   ├── page.tsx          # Marketing-style landing → dashboard links
    │   ├── globals.css       # Tailwind + .prose-dark for markdown
    │   ├── dashboard/
    │   │   ├── page.tsx      # Card dashboard + filters + EntityDetailPanel
    │   │   └── graph/
    │   │       └── page.tsx  # Graph view + sidebar filters + SkillGraph + panel
    │   └── api/
    │       └── entities/[type]/[name]/content/route.ts
    ├── components/
    │   ├── skill-graph.tsx   # ReactFlowProvider, ELK layout, filters, minimap
    │   ├── graph-nodes.tsx   # SkillNode, AgentNode, CommandNode + handles
    │   ├── entity-card.tsx   # Card grid tiles + AGENT_ROLE_FILTER_TABS
    │   ├── entity-detail-panel.tsx  # Slide-over: markdown + connections
    │   └── __tests__/
    ├── hooks/
    │   ├── use-graph-data.ts      # fetch('/graph.json')
    │   ├── use-entity-content.ts  # fetch content API; strips YAML frontmatter
    │   └── use-force-layout.ts    # d3-force integration with React Flow
    ├── lib/
    │   ├── graph-layout.ts   # ELK layout, buildFlowEdges, handle picking
    │   ├── category-styles.ts     # Skill category badges / border-left classes
    │   └── __tests__/
    ├── types/
    │   └── graph.ts          # GraphEntity, GraphEdge, GraphData
    └── test/
        └── setup.ts          # Vitest / jest-dom setup
```

---

## Data model

### Runtime: `GraphData` (`src/types/graph.ts`)

The app types match `public/graph.json`:

- **`EntityType`:** `"skill" | "agent" | "command"`.
- **`GraphSkill`:** `id`, `entityType`, `name`, `description`, `triggers[]`, `category`.
- **`GraphAgent`:** `id`, `entityType`, `name`, `description`, `role`.
- **`GraphCommand`:** `id`, `entityType`, `name`, `description`, `triggers[]`.
- **`GraphEdge`:** `id`, `sourceType`, `sourceId`, `targetType`, `targetId`, `label`.
- **`GraphData`:** `{ entities, edges }`.

### Prisma schema (`prisma/schema.prisma`) — reference only

Retained for documentation and possible reinstatement. It models:

| Model | Role |
|-------|------|
| **User** | Email, password, owns **Workflow**s |
| **Skill** | Unique name, description, triggers, category; **SkillEdge** relations |
| **SkillEdge** | Legacy skill→skill edges (`@@unique([fromSkillId, toSkillId])`) |
| **Agent** | Unique name, description, role |
| **Command** | Unique name, description, triggers |
| **GraphEdge** | Polymorphic edges (`sourceType`/`targetType` + ids) — aligns with JSON graph |
| **Workflow** / **WorkflowStep** | User workflows with positioned skill steps |

**Generator:** `prisma-client` with `output = "../src/generated/prisma"`. The app does not import this client today.

### Persistence decision

See **`docs/adr/ADR-002-remove-backend-static-json.md`**: PostgreSQL, Prisma client usage, and NextAuth were **removed** in favor of **`graph.json` + filesystem reads**. **`docs/adr/ADR-001-nextjs-prisma-postgres-stack.md`** is **superseded**.

---

## Routes & API

### Pages

| Path | File | Description |
|------|------|-------------|
| `/` | `src/app/page.tsx` | Landing; links to dashboard and graph. |
| `/dashboard` | `src/app/dashboard/page.tsx` | Card grid; entity type / skill category / agent role filters; detail panel. |
| `/dashboard/graph` | `src/app/dashboard/graph/page.tsx` | Full-height graph; type toggles; focus selector; counts in header; detail panel. |

All are **client-heavy** (`"use client"` on dashboard pages).

### API

| Method | Path | Handler | Auth |
|--------|------|---------|------|
| **GET** | `/api/entities/[type]/[name]/content` | `src/app/api/entities/[type]/[name]/content/route.ts` | **None** — no middleware, no session checks. |

**Behavior:**

- `type`: `skill` | `agent` | `command` (others → 400).
- `name`: sanitized to `[a-z0-9_.-]`; empty after sanitize → 400.
- Resolves paths under **project root** (`process.cwd()`):
  - **skill:** `.claude/skills/{name}/SKILL.md` with aliases (e.g. `refactor-guide` → `refactor-guide.md`).
  - **agent:** `.cursor/agents/{name}.md`
  - **command:** `.claude/commands/{name}.md`
- Success: `{ content: string }` (raw markdown).
- Missing file: **404** with error payload.

**Security note:** This endpoint reads arbitrary paths **only** through the constrained `type` + sanitized `name`. It is still **unauthenticated**; do not expose it on the public internet without hardening if the repo layout is sensitive.

---

## Graph visualization

### Components

- **`SkillGraph`** (`skill-graph.tsx`): Wraps canvas in `ReactFlowProvider`. Registers `nodeTypes` for `skillNode`, `agentNode`, `commandNode`.
- **`applyGraphFilter`:** Subsets entities/edges by `GraphFilter` (`entityTypes` set, optional `focusEntity` ego network).
- **ELK:** On `layoutData` change, async `elkLayout()` produces node positions and edges; then `fitView` after a short delay.
- **`useForceLayout`:** After nodes exist, **d3-force** (`charge`, `link`, `collide`, weak `x`/`y` centering) runs; **drag** pins the dragged node (`fx`/`fy`) and restarts the simulation.

### `graph-layout.ts`

- **ELK:** Algorithm `stress`; options for edge length, spacing, separate components.
- **Node dimensions:** Default **240×90**; commands **220×90**.
- **`buildFlowEdges`:** Maps `GraphEdge` → React Flow edges; **handle IDs** `top-source`, `left-target`, etc., chosen by **`pickHandles`** from relative node geometry to reduce edge bundling.
- **`edgeStyle`:** Stroke color/dash by `(sourceType, targetType)` — e.g. agent↔agent purple dashed; agent/command amber patterns; edges into skills gray.

### `graph-nodes.tsx`

- **SkillNode:** Left border + glow from **category** string (maps duplicate `category-styles` keys — keep in sync with `category-styles.ts` / dashboard tabs).
- **AgentNode:** Top gradient bar + role badge; **role** drives `AGENT_ROLE_COLORS`.
- **CommandNode:** Dashed amber frame, `/` prefix styling; handles use amber accent.
- **Four-way handles:** Each side has both source and target handles for flexible edge attachment.

---

## Conventions & patterns

### `AGENTS.md`

Contains the **Next.js agent rules** block: this Next version may differ from older docs — check `node_modules/next/dist/docs/` and deprecations. It does **not** define NextAuth rules (auth was removed per ADR-002).

### Category styling

- **Single source for cards:** `src/lib/category-styles.ts` — `badgeClasses()`, `categoryBorderLeftClass()` for skill categories (`planning`, `quality`, `debugging`, etc.).
- **Graph nodes** duplicate category color maps in `graph-nodes.tsx` (`SKILL_BORDER_COLORS`, `SKILL_GLOW`). When adding a category, update **both** unless you refactor to share imports.

### Dashboard filters (`dashboard/page.tsx`)

- **Entity tabs:** All / Skills / Agents / Commands.
- **Skill categories:** Tab list must align with `category-styles` keys (planning, quality, …).
- **Agent roles:** `AGENT_ROLE_FILTER_TABS` exported from `entity-card.tsx` — aligned with agent role styling maps.

### Entity detail panel

- **Tabs:** “Content” (markdown via API) and “Connections” (incoming/outgoing edges with labels).
- **Frontmatter:** `use-entity-content` strips leading `---` YAML blocks before rendering.
- **Markdown:** `prose-dark` in `globals.css` styles headings, links, code for dark UI.

### Data loading

- **`useGraphData`:** `GET /graph.json` from `public/`; exposes `refetch`.

---

## Recent additions (feature summary)

| Area | What shipped |
|------|----------------|
| **Entity content API** | `GET /api/entities/[type]/[name]/content` reads `.md` from project root; aliases for odd skill folder names. |
| **Entity cards** | `EntityCard` grid on `/dashboard` with connection counts, hover/focus styles, role/category visual parity with graph nodes. |
| **Graph page** | Sidebar: show/hide entity types, **focus** dropdown (ego graph), legend, header counts; integrated **`EntityDetailPanel`**. |
| **Detail panel** | Slide-over with React Markdown + GFM, connection lists, open from cards or graph nodes. |

---

## `public/` assets

- **`graph.json`:** Required for the app to render data (entities + edges).
- Other SVGs: default Next branding assets.

---

## `docs/` folder

- **`docs/adr/`** — Stack and static-json ADRs (read ADR-002 for current architecture).
- **`docs/reviews/`** — Exercise outputs (code review, security, schema review, etc.).
- **`docs/project-plan.md`** — Planning notes.

---

## Development commands

```bash
npm install
npm run dev      # Next dev server
npm run build
npm run lint
npx vitest       # tests (no npm script wired by default)
```

---

## Glossary

| Term | Meaning here |
|------|----------------|
| **Entity** | One row in `graph.json` `entities` — skill, agent, or command. |
| **Ego / Focus** | Subgraph: focused node + its neighbors, still filtered by visible types. |
| **React Flow / XYFlow** | `@xyflow/react` — nodes, edges, controls, minimap. |

---

## Orientation checklist for new contributors

1. Read **`docs/adr/ADR-002-remove-backend-static-json.md`** for why there is no DB/auth.
2. Open **`public/graph.json`** and **`src/types/graph.ts`** together.
3. Trace **`useGraphData` → dashboard or `SkillGraph` → `elkLayout` / `useForceLayout`**.
4. Try **`EntityDetailPanel`** + **`use-entity-content`** against a real skill name under `.claude/skills/`.
5. If reintroducing Prisma: align **`GraphEdge`** with **`prisma/schema.prisma`** and regenerate client into `src/generated/prisma`.
