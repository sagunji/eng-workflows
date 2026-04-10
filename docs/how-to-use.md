# How to use SkillFlow

A practical tour of the SkillFlow dashboard: cards, graph, detail panel, and where the data lives. The walkthrough below uses **the same workflow you might have used to build SkillFlow** as the storyline, so every step maps to real nodes and edges in the app.

---

## Quick start

1. Run the app locally (`npm install` then `npm run dev` from the `skillflow` directory).
2. Open [http://localhost:3000](http://localhost:3000) and choose **Open Dashboard**, or go straight to `/dashboard`.
3. Use **Cards** (`/dashboard`) to browse and filter entities; use **Graph** (`/dashboard/graph`) for the interactive node map.
4. Click any card or graph node to open the **detail panel** (slide-over): markdown source, **Connections** tab, **Copy markdown**, **Download markdown**.

The catalogue of skills, agents, commands, and their relationships is defined in **`public/graph.json`**. Edit that file and refresh to change what SkillFlow shows (after a rebuild or dev refresh, depending on your setup).

---

## What you are looking at

SkillFlow is an interactive developer workflow dashboard. It visualises:

| Kind | Count (in default data) | Role |
|------|-------------------------|------|
| **Skills** | 12 | Reusable AI workflows (e.g. `project-planner`, `code-reviewer`) |
| **Agents** | 12 | Specialised roles (e.g. `orchestrator`, `frontend-engineer`) |
| **Commands** | 6 | Cursor-style slash workflows (e.g. `preflight`, `council-implement`) |

**Directed edges** show how things relate: agents delegating to other agents, agents using skills, commands spawning agents or requiring skills, and skill-to-skill chains (e.g. planning leading into ADRs and docs).

---

## Cards view: `/dashboard`

The cards view is the fastest way to **scan everything** and **filter** without touching the graph.

### Filters

- **Entity type:** All, Skills, Agents, or Commands.
- **Skill category** (skills only): Planning, Quality, Debugging, Testing, Documentation, Operations, Performance, Security, Database.
- **Agent role** (agents only): tabs for role groupings (e.g. coordination, implementation, testing).

### Opening details from cards

Click a card. The **detail panel** opens with the same behaviour as in graph view (see [Entity detail panel](#entity-detail-panel) below).

**Example (story):** You are “starting SkillFlow as a product.” On the dashboard, filter to **Skills** and category **Planning**, or search the grid for **project-planner**. Open it and read the full **project-planner** skill instructions in the panel. That is how you would have grounded milestones and risks before writing the first route.

---

## Graph view: `/dashboard/graph`

The graph is built from `public/graph.json` and rendered as a **draggable** node layout.

### Sidebar controls

- **Show:** Toggle **Skills**, **Agents**, and **Commands** on or off. At least one type must stay enabled.
- **Focus:** Choose **Show all**, or pick an **agent** or **command** from the dropdown. Focus mode shows that node’s **ego network** (it and its neighbours), so you can stare at one role or one command without the full graph noise.
- **Legend:** Explains node shapes or styles for Skill vs Agent vs Command. The sidebar also reminds you that you can **drag nodes** to rearrange.

### Interactions

- **Drag** nodes to tidy the layout for screenshots or thinking.
- **Click** a node to open the [Entity detail panel](#entity-detail-panel).

---

## Entity detail panel

Opens as a slide-over when you select an entity from **either** cards or graph.

### Content tab

- Renders **markdown** fetched from the corresponding source (via the app’s entity content API).
- **Copy markdown** copies the raw markdown to the clipboard (useful for pasting into another tool or a scratch doc).
- **Download markdown** saves a file named `{entity-name}.md`.

Skills and agents that map to files on disk will show rich content; if content is missing or still loading, the actions may be disabled.

### Connections tab

Lists **incoming** and **outgoing** edges for the selected entity, with labels where the graph defines them. Use this when you want the exact relationships without panning the canvas.

---

## Walkthrough: building SkillFlow (simulation)

The following is a **narrative tour** of SkillFlow using the graph that ships with the repo. Follow it in the UI to see the same nodes and edges.

### 1. Plan the work: `project-planner`

Suppose you are starting a new project (here: SkillFlow itself). You would begin with **project-planner**: goals, milestones, task breakdown.

- **Cards:** Skills → category **Planning** → open **project-planner**. Read the markdown; check **Connections** to see how planning links to **adr-writer** and, downstream, **doc-writer** in the skill graph.
- **Graph:** Optionally focus **orchestrator** later to see how coordination touches many agents; for a pure planning lens, the skill chain from **project-planner** is enough.

### 2. Delegate implementation: `orchestrator` and `frontend-engineer`

Your **orchestrator** agent decomposes work and delegates. For the dashboard UI, a **frontend-engineer** would own React/Next.js surfaces.

- **Graph:** Set **Focus** to **frontend-engineer**. You should see an ego network that includes **orchestrator** (delegates frontend) and edges from **frontend-engineer** into skills such as **test-writer** and **doc-writer** (writes tests / docs).
- **Meaning:** This mirrors “build the cards, graph, panel, and hooks” while still leaning on shared quality skills.

### 3. Before merge: `code-reviewer` and review pressure

Before merging, you want **code-reviewer** in the loop: static review, complexity, consistency.

In the bundled graph, **qa-lead** connects to **test-writer** (coverage and missing tests), not directly to **code-reviewer**. The **code-reviewer** skill still sits on several realistic paths:

- **council-implement** → **code-reviewer** (cross-review).
- **test-writer** → **code-reviewer** (validates fixes) in the skill-to-skill chain.
- **debt-tracker** → **code-reviewer** (style debt), and **cmd-skill-check** → **code-reviewer** (validation).

Open **code-reviewer** in the panel and use **Connections** to see every incoming and outgoing edge. Then open **qa-lead** and compare: you will see test-generation edges clearly, and you can mentally chain “tests written → review” using the skill edges above.

### 4. Tests: `test-writer` and multiple agents

**test-writer** is shared infrastructure: several agents point at it.

- **Graph:** Focus **test-writer** is not in the Focus dropdown (only agents and commands). Instead, click the **test-writer** node on the canvas, or use **Cards** → Skills → **Testing** → **test-writer**.
- **Connections:** Notice edges from **frontend-engineer**, **backend-engineer**, **shared-engineer**, and **qa-lead** into **test-writer**, plus command edges from **council-implement** and **skill-check**. That matches “UI, API, shared package, and QA all need tests.”

### 5. Ready to ship: `deploy-checklist`, `preflight`, and `pr-packager`

Shipping touches **operations** skills and **release** automation.

- Open **deploy-checklist** (skill, category **Operations**). In **Connections**, you will see how it relates to **security-auditor** (pre-deploy audit) and how **pr-packager** pulls it in to **generate checklist**.
- Open **preflight** (command). The graph links **orchestrator** → **preflight** (runs preflight) and **preflight** → **council-review** (escalates when you need a fuller review gate).
- Open **pr-packager**: edges to **pr-describer**, **deploy-checklist**, **context-generator**, and **secret-guard** illustrate “bundle the PR, checklist, context update, and safety scan.”

That is the SkillFlow-shaped story of “run preflight, escalate if needed, package the PR with checklist and description.”

### 6. Offline reference: copy and download

Any time you are in the detail panel for a skill (or another entity with loaded markdown), use **Copy markdown** or **Download markdown** so you can read or edit the same instructions outside the browser—handy when you are in the editor or sharing a snippet with a teammate.

---

## Graph data: `public/graph.json`

The file has two top-level keys:

- **`entities`:** Each item has an `id`, `entityType` (`skill` | `agent` | `command`), `name`, `description`, and type-specific fields (`category` for skills, `role` for agents, optional `triggers` for skills/commands).
- **`edges`:** Each edge has `sourceId`, `targetId`, optional `label`, and parallel `sourceType` / `targetType` for clarity.

If you add a new skill file in your monorepo, you typically add a matching **entity** and any **edges** that reflect how agents or commands should use it, then reload SkillFlow.

---

## URLs at a glance

| URL | Purpose |
|-----|---------|
| `/` | Landing page with links to dashboard and graph |
| `/dashboard` | Filterable cards for all entities |
| `/dashboard/graph` | Interactive graph, sidebar filters, focus, legend |

---

## Closing tip

Use **Cards** when you are **browsing or filtering by category or role**. Use **Graph** when you are **reasoning about workflows and delegation**. Use the **detail panel** when you need **full markdown**, **exact adjacency**, or a **portable copy** of a skill. The storyline above is the same path many teams take for a real feature; SkillFlow just makes the graph explicit.
