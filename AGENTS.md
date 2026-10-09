# AGENTS.md

> Note: This file is the authoritative source for coding agent instructions. If
> in doubt, prefer AGENTS.md over README.md. See nested AGENTS.md files in each
> workspace for app-specific patterns.

## Commands

| Command | Purpose |
| --- | --- |
| `bun install` | Install dependencies |
| `bun dev` | Build widgets and start MCP server and UI watchers on port 9009 |
| `bun start` | Run the bundled MCP server after building |
| `bun --filter=server-mcp run dev` | Start server and UI watchers after building |
| `bun run build` | Build all packages |
| `bun type-check` | Type-check all packages |
| `bun lint` | Lint with Biome |
| `bun format` | Format with Biome |
| `bun run test` | Run unit tests with Vitest |
| `bun run test:e2e` | Build and test the production server and widgets |

## Task Completion Requirements

All of `bun format`, `bun lint`, and `bun type-check` must pass before considering tasks completed.
NEVER run `bun test`. Always use `bun run test` (runs Vitest).

## Tech Stack

Bun 1.4+, TypeScript 6, Effect 4.0.2, Lit 3, Vite 8, Vitest 5, Tailwind CSS
4, Biome 2.4

## Dependency Patching (.patch)

Use Bun's patch workflow for any changes to dependencies and `.patch` files.

- `https://bun.com/docs/pm/cli/patch` <- Bun patch docs

## Structure

| Workspace         | Stack              | AGENTS.md                   |
| ----------------- | ------------------ | --------------------------- |
| `apps/server-mcp` | Effect MCP Server  | `apps/server-mcp/AGENTS.md` |
| `packages/lit-lab` | MCP Apps SDK, widget HTML | Root instructions |
| `packages/ui-lit` | Shared Lit components | Root instructions |

## MCP Apps References

- Blog overview: https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/
- Quickstart: https://modelcontextprotocol.github.io/ext-apps/api/documents/Quickstart.html

## Local Source References

When answering questions about Effect, MCP Apps, or the MCP spec, search these
cloned source repos first:

- `.reference/effect-current/`
- `.reference/ext-apps/`
- `.reference/mcp-spec/`

If any of the folders are missing (they are git ignored), clone them into
`.reference/`:

- `https://github.com/Effect-TS/effect.git` -> `.reference/effect-current/`
- `https://github.com/modelcontextprotocol/ext-apps.git` -> `.reference/ext-apps/`
- `https://github.com/modelcontextprotocol/modelcontextprotocol.git` -> `.reference/mcp-spec/`

---

_This document is a living guide. Update it as the project evolves and new
patterns emerge._
