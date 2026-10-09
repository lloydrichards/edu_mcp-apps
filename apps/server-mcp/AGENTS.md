# MCP Apps server instructions

Follow the root `AGENTS.md`.

- Use Effect v4 imports from `effect/ai` and `effect/http`.
- Declare implemented adapters with `McpServer.layerHttp({ protocols: [...] })`.
- Provide the server layer to the resource and toolkit registration layers.
- Link render tools to `ui://` resources through `_meta.ui.resourceUri`.
- Return `text/html;profile=mcp-app` resources with UI CSP metadata.
- Keep widget sources in `packages/lit-lab/src` and build each as standalone HTML.
- Register SDK handlers before `App.connect()`. Stop timers during teardown.
- Use `bun dev` from the root to build resources before starting the server.
- Run tests with `bun run test`, never `bun test`.
- Run `bun run test:e2e` to test the production server and widget interactions.

The default endpoint is `http://localhost:9009/mcp`. `MCP_PORT` overrides the port.
