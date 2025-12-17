
<!-- OPENSPEC:START -->
# OpenSpec + Auto-Dev Instructions

These instructions are for AI assistants working in this project.

## Auto-Dev Scheduler (Multi-Claude Parallel Execution)

When user asks about Auto-Dev Scheduler usage, read `@/docs/CLAUDE-GUIDE.md` for:
- How to start the scheduler
- How to create AUTO-DEV.md task files
- Task ID format and dependency syntax
- Troubleshooting guide

Quick start (Electron version):
```bash
cd tools/auto-dev-scheduler-web
npm install
npm run dev
```

## OpenSpec (Spec-Driven Development)

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts
- Sounds ambiguous and you need the authoritative spec before coding

<!-- OPENSPEC:END -->
