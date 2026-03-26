# AGENTS.md

> Note: This file is the authoritative source for coding agent instructions. If
> in doubt, prefer AGENTS.md over README.md. See nested AGENTS.md files in each
> workspace for app-specific patterns.

## Commands

| Command                                            | Purpose                                   |
| -------------------------------------------------- | ----------------------------------------- |
| `bun install`                                      | Install dependencies                      |
| `bun dev`                                          | Start all apps (client:3000, server:9000) |
| `bun dev --filter=client`                          | Start client only                         |
| `bun dev --filter=server`                          | Start server only                         |
| `bun run build`                                    | Build all apps                            |
| `bun type-check`                                   | Type check with Bun                       |
| `bun lint`                                         | Lint with Biome                           |
| `bun format`                                       | Format with Biome                         |
| `bun run test`                                     | Run all tests (Vitest)                    |
| `bun run test --filter=server -- src/file.test.ts` | Run single test file                      |

## Task Completion Requirements

All of `bun format`, `bun lint`, and `bun type-check` must pass before considering tasks completed.
NEVER run `bun test`. Always use `bun run test` (runs Vitest).

## Tech Stack

Bun 1.2+, TypeScript 5.9, Effect 3.19, React 19, Vite 7, Vitest 4, Tailwind CSS
4, Biome 2.3

## Dependency Patching (.patch)

Use Bun's patch workflow for any changes to dependencies and `.patch` files.

- `https://bun.com/docs/pm/cli/patch` <- Bun patch docs

## Structure

| Workspace         | Stack              | AGENTS.md                   |
| ----------------- | ------------------ | --------------------------- |
| `apps/server-mcp` | Effect MCP Server  | `apps/server-mcp/AGENTS.md` |
| `packages/domain` | Effect Schema, RPC | `packages/domain/AGENTS.md` |

## MCP Apps References

- Blog overview: https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/
- Quickstart: https://modelcontextprotocol.github.io/ext-apps/api/documents/Quickstart.html

## Local Source References

When answering questions about Effect, MCP Apps, or the MCP spec, search these
cloned source repos first:

- `.reference/effect/`
- `.reference/ext-apps/`
- `.reference/mcp-spec/`

If any of the folders are missing (they are git ignored), clone them into
`reference/`:

- `https://github.com/Effect-TS/effect-smol.git` -> `.reference/effect/`
- `https://github.com/modelcontextprotocol/ext-apps.git` -> `.reference/ext-apps/`
- `https://github.com/modelcontextprotocol/modelcontextprotocol.git` -> `.reference/mcp-spec/`

---

_This document is a living guide. Update it as the project evolves and new
patterns emerge._
