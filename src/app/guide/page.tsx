import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guide — SkillFlow",
  description: "AI-powered engineering workflows you can use in your own projects. Skills, agents, and commands for development, review, testing, debugging, and deployment.",
};

const LAYER_CARDS = [
  {
    layer: "Skills",
    count: 12,
    tagline: "Trigger with natural language",
    description: "Focused capabilities that activate when you describe what you need. Say \"review this code\" and the code-reviewer skill runs. Say \"this is slow\" and perf-profiler investigates.",
    color: "border-gray-600 bg-gray-700/20",
    dot: "bg-gray-400",
    examples: [
      { name: "code-reviewer", trigger: "\"review this code\"" },
      { name: "test-writer", trigger: "\"write tests for this\"" },
      { name: "debug-detective", trigger: "\"it's not working\"" },
      { name: "project-planner", trigger: "\"plan this project\"" },
    ],
  },
  {
    layer: "Agents",
    count: 12,
    tagline: "Specialist roles for focused work",
    description: "Domain experts that own specific areas: frontend, backend, security, QA. The orchestrator dispatches them based on what the task needs. They follow strict standards and write tests alongside code.",
    color: "border-violet-500/30 bg-violet-500/10",
    dot: "bg-violet-400",
    examples: [
      { name: "orchestrator", trigger: "Coordinates everything" },
      { name: "frontend-engineer", trigger: "React/Next.js implementation" },
      { name: "backend-engineer", trigger: "API, services, DB" },
      { name: "verifier", trigger: "Types, lint, tests, build" },
    ],
  },
  {
    layer: "Commands",
    count: 6,
    tagline: "Invoke structured workflows",
    description: "Multi-step workflows you run explicitly. /council-implement builds a feature with a full team of agents. /preflight checks your code before every commit. /council-review runs a 5-role quality gate.",
    color: "border-amber-500/30 bg-amber-500/10",
    dot: "bg-amber-400",
    examples: [
      { name: "/council-implement", trigger: "Build with a council of agents" },
      { name: "/council-review", trigger: "5-role quality gate" },
      { name: "/preflight", trigger: "Pre-commit sanity check" },
      { name: "/retro", trigger: "Sprint or incident retrospective" },
    ],
  },
];

const SKILL_CATEGORIES = [
  {
    title: "Code quality",
    skills: [
      { name: "code-reviewer", does: "Structured review: correctness, security, readability, performance. Three severity levels.", say: "review this, check my code, look at this PR" },
      { name: "refactor-guide", does: "Safe, sequenced refactoring plan. Each step independently verifiable.", say: "refactor this, clean this up, this function is too big" },
    ],
  },
  {
    title: "Testing and debugging",
    skills: [
      { name: "test-writer", does: "Unit, integration, and edge-case tests. Infers framework from your repo.", say: "write tests for this, add test coverage" },
      { name: "debug-detective", does: "Systematic diagnosis from errors, stack traces, or \"it's broken\". Ranked hypotheses, confirmed root cause before any fix.", say: "it's not working, I'm getting an error, help me debug" },
    ],
  },
  {
    title: "Performance and security",
    skills: [
      { name: "perf-profiler", does: "Finds specific bottlenecks: N+1 queries, re-renders, large bundles, blocking I/O.", say: "this is slow, queries are taking too long" },
      { name: "security-auditor", does: "Eight-vector audit: injection, auth, secrets, validation, data exposure, CSRF/XSS.", say: "security audit, is this secure" },
      { name: "db-schema-reviewer", does: "Schema, migration, and ORM review. Lock risk, missing indexes, naming.", say: "review this migration, check my schema" },
    ],
  },
  {
    title: "Documentation and workflow",
    skills: [
      { name: "doc-writer", does: "READMEs, docstrings, API references, ADRs, changelogs. Matches your style.", say: "write a README, document this, add docstrings" },
      { name: "project-planner", does: "Goals, milestones, sprint breakdown, task list, risk register.", say: "plan this project, break this into tasks" },
      { name: "deploy-checklist", does: "Pre-deployment gates tailored to your stack. Six verification phases.", say: "I'm about to deploy, ready to ship" },
    ],
  },
];

const WORKFLOW_RECIPES = [
  {
    title: "Ship a feature",
    subtitle: "Full lifecycle from idea to production",
    steps: [
      { action: "\"plan this project\"", result: "project-planner creates goals, milestones, tasks" },
      { action: "/council-implement [feature]", result: "Orchestrator dispatches FE + BE + shared + verifier" },
      { action: "/council-review", result: "5-role quality gate: architecture, QA, security, DX, maintenance" },
      { action: "\"prepare this PR\"", result: "pr-packager runs preflight + writes PR + deploy checklist" },
      { action: "\"deploying to production\"", result: "deploy-checklist generates pre-deployment gates" },
      { action: "/retro feature", result: "Lessons learned + skill gap report" },
    ],
  },
  {
    title: "Fix a production bug",
    subtitle: "From error to verified fix",
    steps: [
      { action: "\"it's crashing with: [error]\"", result: "debug-detective classifies, hypothesises, finds root cause" },
      { action: "Apply the suggested fix", result: "You implement the change" },
      { action: "\"write tests for the fix\"", result: "test-writer locks the fix with regression tests" },
      { action: "/preflight", result: "Pre-commit check: secrets, debug artefacts, diff sanity" },
      { action: "\"prepare this PR\"", result: "pr-packager bundles everything" },
    ],
  },
  {
    title: "Improve code quality",
    subtitle: "Targeted audits across your codebase",
    steps: [
      { action: "\"check my schema\"", result: "db-schema-reviewer finds missing indexes, lock risks" },
      { action: "\"security audit\"", result: "security-auditor traces every user-controlled value" },
      { action: "\"this is slow\"", result: "perf-profiler identifies specific bottlenecks with evidence" },
      { action: "\"refactor this\"", result: "refactor-guide plans safe, sequenced changes" },
      { action: "/council-review", result: "Full 5-role review on your changes" },
    ],
  },
];

function RecipeCard({ recipe }: { recipe: (typeof WORKFLOW_RECIPES)[number] }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6">
      <h3 className="text-lg font-semibold text-white">{recipe.title}</h3>
      <p className="mt-1 text-sm text-gray-500">{recipe.subtitle}</p>
      <ol className="mt-5 space-y-3">
        {recipe.steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-800 text-[11px] font-bold text-gray-400">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="font-mono text-sm text-cyan-300">{step.action}</p>
              <p className="mt-0.5 text-xs text-gray-500">{step.result}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function GuidePage() {
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-30 border-b border-gray-800/80 bg-gray-950/90 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="text-xl font-semibold tracking-tight text-white transition-colors hover:text-gray-300"
            >
              SkillFlow
            </Link>
            <nav className="flex gap-2" aria-label="Navigation">
              <Link
                href="/dashboard"
                className="rounded-full bg-gray-900 px-4 py-1.5 text-sm font-medium text-gray-400 border border-gray-800 transition-all duration-200 hover:text-gray-200 hover:border-gray-700"
              >
                Cards
              </Link>
              <Link
                href="/dashboard/graph"
                className="rounded-full bg-gray-900 px-4 py-1.5 text-sm font-medium text-gray-400 border border-gray-800 transition-all duration-200 hover:text-gray-200 hover:border-gray-700"
              >
                Graph
              </Link>
              <Link
                href="/guide"
                className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-950 shadow-md shadow-black/20"
              >
                Guide
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-cyan-400">
            Engineering workflows
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            AI-powered workflows for<br />your development process
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-400">
            12 skills, 12 agents, and 6 commands that turn common engineering tasks
            into repeatable, high-quality processes. Works with Claude and Cursor.
            Use them in your own project.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition-all hover:bg-cyan-500"
            >
              Explore the catalogue
            </Link>
            <a
              href="#recipes"
              className="text-sm font-semibold text-gray-300 transition-colors hover:text-white"
            >
              See workflow recipes <span aria-hidden="true">&darr;</span>
            </a>
          </div>
        </section>

        {/* How it works — three layers */}
        <section className="mt-24">
          <h2 className="text-2xl font-bold text-white">How it works</h2>
          <p className="mt-2 text-sm text-gray-400">
            Three layers, each building on the one below. Skills are the atoms, agents compose them, commands orchestrate everything.
          </p>

          <div className="mt-8 space-y-6">
            {LAYER_CARDS.map((layer) => (
              <div key={layer.layer} className={`rounded-2xl border p-6 ${layer.color}`}>
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${layer.dot}`} />
                  <h3 className="text-lg font-semibold text-white">{layer.layer}</h3>
                  <span className="rounded-full bg-gray-800/60 px-2.5 py-0.5 text-xs font-medium text-gray-400">
                    {layer.count}
                  </span>
                  <span className="ml-auto text-xs text-gray-500">{layer.tagline}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">
                  {layer.description}
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {layer.examples.map((ex) => (
                    <div key={ex.name} className="flex items-baseline gap-2 rounded-lg bg-gray-950/40 px-3 py-2">
                      <span className="font-mono text-sm font-medium text-gray-200">{ex.name}</span>
                      <span className="text-xs text-gray-500">{ex.trigger}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick start — what you say */}
        <section className="mt-24">
          <h2 className="text-2xl font-bold text-white">Use them with natural language</h2>
          <p className="mt-2 text-sm text-gray-400">
            Skills trigger automatically when you describe what you need. No configuration, no setup. Just talk.
          </p>
          <div className="mt-8 space-y-8">
            {SKILL_CATEGORIES.map((cat) => (
              <div key={cat.title}>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  {cat.title}
                </h3>
                <div className="mt-3 space-y-2">
                  {cat.skills.map((skill) => (
                    <div key={skill.name} className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-mono text-sm font-semibold text-white">{skill.name}</p>
                          <p className="mt-1 text-sm text-gray-400">{skill.does}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {skill.say.split(", ").map((phrase) => (
                          <span key={phrase} className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300 border border-cyan-500/20">
                            {phrase}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Workflow recipes */}
        <section id="recipes" className="mt-24 scroll-mt-24">
          <h2 className="text-2xl font-bold text-white">Workflow recipes</h2>
          <p className="mt-2 text-sm text-gray-400">
            Copy these patterns into your own projects. Each recipe is a sequence of
            skills, agents, and commands that handle a complete engineering scenario.
          </p>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {WORKFLOW_RECIPES.map((recipe) => (
              <RecipeCard key={recipe.title} recipe={recipe} />
            ))}
          </div>
        </section>

        {/* How to adopt */}
        <section className="mt-24">
          <h2 className="text-2xl font-bold text-white">Adopt in your project</h2>
          <p className="mt-2 text-sm text-gray-400">
            These workflows are files in your repo. Copy them and they work.
          </p>
          <div className="mt-8 space-y-4">
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-sm font-bold text-gray-400">1</span>
                <div>
                  <p className="text-sm font-semibold text-white">Copy the skill and agent files</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Skills go in <code className="rounded bg-gray-800 px-1.5 py-0.5 text-cyan-300">.claude/skills/</code>,
                    agents in <code className="rounded bg-gray-800 px-1.5 py-0.5 text-cyan-300">.cursor/agents/</code>,
                    commands in <code className="rounded bg-gray-800 px-1.5 py-0.5 text-cyan-300">.claude/commands/</code>
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-sm font-bold text-gray-400">2</span>
                <div>
                  <p className="text-sm font-semibold text-white">Use natural language to trigger skills</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Say &ldquo;review this code&rdquo; and code-reviewer activates. Say &ldquo;it&apos;s not working&rdquo; and debug-detective runs.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-sm font-bold text-gray-400">3</span>
                <div>
                  <p className="text-sm font-semibold text-white">Use commands for multi-step workflows</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Type <code className="rounded bg-gray-800 px-1.5 py-0.5 text-cyan-300">/council-implement</code> to build a feature with a full agent council,
                    or <code className="rounded bg-gray-800 px-1.5 py-0.5 text-cyan-300">/preflight</code> before every commit.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-sm font-bold text-gray-400">4</span>
                <div>
                  <p className="text-sm font-semibold text-white">Customise with overrides</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    <code className="rounded bg-gray-800 px-1.5 py-0.5 text-cyan-300">/skill-override test-writer &ldquo;we use Vitest, never Jest&rdquo;</code> --
                    persistent, traceable, revertible customisation of any skill.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use SkillFlow to explore */}
        <section className="mt-24">
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-6 py-6">
            <h2 className="text-lg font-semibold text-cyan-300">
              Use SkillFlow to explore before you adopt
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              Browse the full catalogue of skills, agents, and commands in the{" "}
              <Link href="/dashboard" className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300">Cards view</Link>.
              See how they connect in the{" "}
              <Link href="/dashboard/graph" className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300">Graph view</Link>.
              Click any entity to read its full instructions. Use <strong className="text-gray-200">Copy</strong> or{" "}
              <strong className="text-gray-200">Download</strong> to grab the files you want, with or without their connected entities.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                href="/dashboard"
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-500"
              >
                Browse catalogue
              </Link>
              <Link
                href="/dashboard/graph"
                className="rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              >
                View connections
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-16 mb-12" />
      </main>
    </div>
  );
}
