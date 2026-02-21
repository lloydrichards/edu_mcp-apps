# MCP Apps Server AGENTS.md

> See root `/AGENTS.md` for monorepo conventions.

## Commands

| Command                        | Purpose                      |
| ------------------------------ | ---------------------------- |
| `bun dev --filter=server-mcp`  | Start MCP server (port 9009) |
| `bun test --filter=server-mcp` | Run MCP tests                |

## MCP Apps Focus

The `apps/server-mcp` workspace is the primary playground for MCP Apps.
Prioritize experiments that render interactive Views in MCP hosts and validate
them with the MCP Apps inspector.

## MCP Apps Essentials

- **MCP Apps = Tool + UI Resource** linked via `_meta.ui.resourceUri`
- **UI resources** use the `ui://` scheme and serve bundled HTML/JS
- **Hosts** render the UI in a sandboxed iframe and use JSON-RPC over
  `postMessage` for app-to-host communication

## MCP Components

```typescript
// 1. Resources - static content
McpServer.resource({
  uri: "app://primer",
  name: "Primer Document",
  description: "Documentation for the application",
  content: Effect.succeed("Content here"),
});

// 2. Prompts - parameterized templates
McpServer.prompt({
  name: "Hello Prompt",
  parameters: Schema.Struct({ name: Schema.String }),
  content: ({ name }) => Effect.succeed(`Hello, ${name}!`),
});

// 3. Tools - executable actions
class MyTools extends Toolkit.make(
  Tool.make("ToolName", {
    description: "Tool description",
    parameters: { arg: Schema.String },
    success: Schema.String,
    failure: Schema.Never,
  })
) {}

// Implement tools
McpServer.toolkit(MyTools).pipe(
  Layer.provide(
    MyTools.toLayer(
      Effect.succeed({
        ToolName: ({ arg }) => Effect.succeed(`Result: ${arg}`),
      })
    )
  )
);
```

## MCP Apps Registration Pattern

```typescript
import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";

const resourceUri = "ui://example/mcp-app.html";

registerAppTool(server, "example", {
  title: "Example",
  description: "Returns example data.",
  inputSchema: {},
  _meta: { ui: { resourceUri } },
}, async () => ({
  content: [{ type: "text", text: "Hello from MCP Apps" }],
}));

registerAppResource(
  server,
  resourceUri,
  resourceUri,
  { mimeType: RESOURCE_MIME_TYPE },
  async () => ({
    contents: [
      {
        uri: resourceUri,
        mimeType: RESOURCE_MIME_TYPE,
        text: "<html>...</html>",
      },
    ],
  })
);
```

## Layer Composition

```typescript
// Merge all MCP components
const McpLive = Layer.mergeAll(ResourceLayer, PromptLayer, ToolLayer);

// Create HTTP router
const McpRouter = McpServer.layerHttpRouter({
  name: "Server Name",
  version: "0.1.0",
  path: "/mcp",
}).pipe(Layer.provideMerge(McpLive));

// Serve
HttpLayerRouter.serve(McpRouter).pipe(Layer.launch);
```

## Environment

```bash
MCP_PORT=9009  # MCP server port (default)
```

## References

- MCP Apps Blog: https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/
- MCP Apps Quickstart: https://modelcontextprotocol.github.io/ext-apps/api/documents/Quickstart.html

---

_This document is a living guide. Update it as the project evolves and new
patterns emerge._
