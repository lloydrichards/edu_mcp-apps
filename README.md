# MCP Apps w/ Effect (Lab)

Exploration of the MCP Apps specification ([SEP-1865](https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/draft/apps.mdx)) using Effect v4-beta
to build generative UI components for chat applications. This workspace focuses
on the MCP server side only.

## Features

- **TypeScript + Effect**: Type-safe schemas and functional architecture
- **Shared Domain**: Common types and utilities across the workspace
- **Effect Integration**: Built for composable, functional programming with
  [Effect](https://effect.website)
- **MCP Server**: [Model Context Protocol](https://modelcontextprotocol.io/)
  server for AI assistant tools, resources, and UI responses
- **Modern Tooling**: [Turborepo](https://turbo.build/) and [Bun](https://bun.sh/)
- **Zero Config**: Pre-configured [Ultracite](https://www.ultracite.ai/) for
  linting and formatting with [Biome](https://biomejs.dev)
- **Flexible Deployment**: Deploy anywhere without vendor lock-in

## Quick Start

```bash
# Install dependencies
bun install

# Start development
bun dev

# Build for production
bun run build
```

### Formatting and Linting

Format and lint the codebase using Ultracite:

```bash
# Format code
bun format

# Lint code
bun lint

# Type check
bun type-check
```

### Testing

Run tests across the monorepo:

```bash
# Run all unit tests
bun run test

# Run tests for the MCP server
bun run test --filter=server-mcp
```

### Test Stack

- **Server**: Vitest 4.x with Node environment, @effect/vitest

## Project Structure

```txt
.
├── apps/
│   └── server-mcp/         # Model Context Protocol server
├── packages/
│   ├── config-typescript/  # TypeScript configurations
│   └── domain/             # Shared Schema definitions
├── package.json            # Root package.json with workspaces
└── turbo.json              # Turborepo configuration
```

### Apps

| App          | Description                                                                                                     |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| `server-mcp` | A [Model Context Protocol](https://modelcontextprotocol.io/) server built with [Effect](https://effect.website) |

### Packages

| Package                   | Description                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| `@repo/config-typescript` | TypeScript configurations used throughout the monorepo                                            |
| `@repo/domain`            | Shared Schema definitions using [Effect Schema](https://effect.website/docs/schema)               |

## Development

```bash
# Start development server
bun dev
# Run MCP server only
bun dev --filter=server-mcp

# Build all apps
bun run build
```

## MCP Apps Dev Inspector

Use the MCP Apps inspector to validate UI resources and tool responses.

```bash
# From the monorepo root
bun --filter=server-mcp run inspector
```

This runs the MCP server in watch mode and opens the inspector.

## Type Safety

Import shared types from the domain package:

```typescript
import { ApiResponse } from "@repo/domain";
```

## Learn More

- [Turborepo](https://turborepo.com/docs)
- [Effect](https://effect.website/docs/introduction)
