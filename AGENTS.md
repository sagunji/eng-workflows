<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Toolkit reference

This project ships a full AI workflow toolkit. See `CLAUDE.md` for the
complete index of all skills, agents, and commands.

Key entry points:
- **Start here:** `orchestrator` agent coordinates everything
- **Quick checks:** `/preflight` before commits, `/council-review` before merging
- **Skills auto-trigger** — just describe what you need in natural language
