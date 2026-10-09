# MCP Apps with Effect

Run the existing MCP Apps examples with Effect 4.0.2, the MCP Apps SDK 2.0.3,
Lit, and Bun. The server exposes seven UI resources and ten tools over Streamable
HTTP at `http://localhost:9009/mcp`.

## Run the app

Use Bun 1.4 or newer.

```bash
bun install
bun dev
```

`bun dev` builds the UI resources before starting the server and build watchers.
Connect an MCP Apps host to `http://localhost:9009/mcp`. Set `MCP_PORT` to use a
different port.

To use the inspector, keep the server running and start the inspector in another
terminal:

```bash
bun --filter=server-mcp run inspector
```

Add `http://localhost:9009/mcp` as a Streamable HTTP server in the inspector.

To run the bundled server:

```bash
bun run build
bun start
```

The examples are a counter, server-time card, bar chart, line chart, polling
dashboard, log explorer, and Pomodoro timer. Dashboard statistics and logs are
simulated. Charts and Shoelace components load from `cdn.jsdelivr.net`, so those
widgets need internet access.

## Verify changes

```bash
bun format
bun lint
bun type-check
bun run test
bun run test:e2e
```

The browser smoke test uses installed Google Chrome. It builds and starts the
production server on port `9010`, negotiates an MCP session, reads every UI
resource, and loads each widget in a test host. It checks initialization,
chart rendering, counter actions, time refresh, polling, logs, and timer controls.
The test host proxies tool calls to the real server. It does not replace testing
in your chosen MCP Apps host. There are currently no unit tests.

## Repository layout

- `apps/server-mcp`: Effect tools, UI-resource registrations, and HTTP server.
- `packages/lit-lab`: widget HTML, MCP Apps lifecycle, and single-file builds.
- `packages/ui-lit`: shared Lit components and styles.
- `packages/config-typescript`: shared compiler settings.
- `e2e`: browser and MCP integration smoke test.

Each widget builds separately so its HTML contains its own JavaScript without
relative chunk imports. The server bundles these HTML files into its executable.

See the [server notes](apps/server-mcp/README.md) for transport and registration
details, and the [MCP Apps quickstart](https://modelcontextprotocol.github.io/ext-apps/api/documents/Quickstart.html)
for host integration.
