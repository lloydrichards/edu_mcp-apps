# MCP Apps server

The server uses `McpServer`, `McpProtocol`, `Tool`, and `Toolkit` from `effect/ai`.
It serves Streamable HTTP at `/mcp`, with protocol adapters for `2026-07-28`,
`2025-11-25`, `2025-06-18`, and `2025-03-26`. MCP Apps uses its separate UI protocol through the SDK in each
widget.

## Run the server

From the repository root:

```bash
bun install
bun dev
```

For a production build:

```bash
bun run build
bun start
```

The default port is `9009`. Override it with `MCP_PORT`.

## Registration and lifecycle

`src/index.ts` composes resources, tools, and the simulated log producer, then
provides `McpServer.layerHttp` to those registration layers. The HTTP router
serves the resulting layer through `BunHttpServer`.

`src/service/McpAppService.ts` contains registration helpers. Render tools link
to resources through `_meta.ui.resourceUri`. Polling tools declare
`_meta.ui.visibility: ["app"]`. Resources return bundled HTML with the
`text/html;profile=mcp-app` MIME type and UI security metadata.

Widget sources live in `packages/lit-lab/src`. They register handlers before
calling `App.connect()`. The SDK handles initialization, tool requests, and
size notifications. Polling and timer widgets stop their intervals during
teardown. Shared host-context handling applies themes, fonts, style variables,
and safe-area padding.

The browser smoke test runs the bundled server and exercises all seven UI
resources. Run it from the root with `bun run test:e2e`.
