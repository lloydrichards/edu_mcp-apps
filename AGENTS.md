# AGENTS.md

Exploration workspace for MCP Apps, the MCP extension that lets tools return
interactive UI elements rendered inside chat clients. Most experiments live in
`apps/server-mcp` and are validated with the MCP Apps inspector.

> Note: This file is the authoritative source for coding agent instructions. If
> in doubt, prefer AGENTS.md over README.md. See nested AGENTS.md files in each
> workspace for app-specific patterns.

## Commands

| Command                                        | Purpose                   |
| ---------------------------------------------- | ------------------------- |
| `bun install`                                  | Install dependencies      |
| `bun dev`                                      | Start all apps (mcp:9009) |
| `bun run build`                                | Build all apps            |
| `bun lint`                                     | Lint with Biome           |
| `bun format`                                   | Format with Biome         |
| `bun test`                                     | Run all tests (Vitest)    |
| `bun test --filter=server -- src/file.test.ts` | Run single test file      |

## Tech Stack

Bun 1.2+, TypeScript 5.9, Effect 3.19, React 19, Vite 7, Vitest 4, Tailwind CSS
4, Biome 2.3

## Code Style

- **Formatting**: Spaces (not tabs), double quotes for strings
- **Imports**: Use `@repo/domain` for shared types; Biome auto-organizes imports
- **Types**: Effect Schema for validation; `typeof Schema.Type` for inline
  types, `Schema.Schema.Type<typeof T>` for exports
- **Naming**: camelCase variables/functions, PascalCase types/classes/React
  components
- **Effect patterns**: `Effect.gen` + `yield*` for all Effect operations; Layer
  composition for DI
- **Error handling**: Use Effect error channel; avoid try/catch

## Dependency Patching (.patch)

Use Bun's patch workflow for any changes to dependencies and `.patch` files.

```bash
# 1) Prepare a safe, unlinked copy in node_modules
bun patch <pkg>

# 2) Edit the package in node_modules and validate locally

# 3) Commit the patch file and metadata
bun patch --commit <pkg>
```

- Always run `bun patch <pkg>` before editing `node_modules` to avoid touching
  Bun's global cache.
- `bun patch --commit <pkg>` writes a patch into `patches/`, updates
  `package.json` (`patchedDependencies`), and updates the lockfile.
- Prefer `bun patch --commit <pkg>@<version>` when multiple versions are
  installed.
- Keep `.patch` files in `patches/` unless a different directory is explicitly
  required.

## Effect Essentials

```typescript
// Always use yield* to unwrap Effect values
Effect.gen(function* () {
  const service = yield* MyService; // Access service from Context
  const result = yield* service.method(); // Unwrap Effect result
  yield* Effect.log("done"); // Side effects
  return result;
});
```

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
- `.reference/spec/`

If any of the folders are missing (they are git ignored), clone them into
`reference/`:

- `https://github.com/Effect-TS/effect-smol.git` -> `.reference/effect/`
- `https://github.com/modelcontextprotocol/ext-apps.git` -> `.reference/ext-apps/`
- `https://github.com/modelcontextprotocol/modelcontextprotocol.git` -> `.reference/spec/`

---

_This document is a living guide. Update it as the project evolves and new
patterns emerge._
