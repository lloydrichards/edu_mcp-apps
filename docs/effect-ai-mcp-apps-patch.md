# Effect MCP Apps Patch Notes

Date: 2026-02-21

This document captures the local patches applied to Effect's MCP server runtime
to support MCP Apps (SEP-1865 / io.modelcontextprotocol/ui) and where they live
in this repo.

Status
- Applied via patch-package in this monorepo.
- Not yet upstreamed to Effect or mirrored into .reference/effect.

Why
MCP Apps uses `capabilities.extensions` for negotiation and `_meta.ui.*` on
tools/resources. The current Effect schemas reject these fields and the server
does not advertise the MCP Apps extension.

Patch Summary
1) Allow `extensions` in capabilities
- Client capabilities now accept `extensions: Record<string, unknown>`.
- Server capabilities now accept `extensions: Record<string, unknown>`.

2) Allow `_meta` on tools/resources/resource contents
- Tool schema now accepts `_meta` for `ui.resourceUri` metadata.
- Resource schema now accepts `_meta` (for UI metadata on list entries).
- ResourceContents now accepts `_meta` (for UI metadata on `resources/read`).

3) Advertise MCP Apps from initialize
- Initialize response includes:
  `capabilities.extensions["io.modelcontextprotocol/ui"] = {}`

4) Store client capabilities
- The server stores `params.capabilities` per client id.
- A getter is added for `getClientCapabilities(clientId)`.

Patch File
- `patches/@effect+ai@0.33.2.patch`

Patched Files (package)
- `node_modules/@effect/ai/dist/esm/McpSchema.js`
- `node_modules/@effect/ai/dist/cjs/McpSchema.js`
- `node_modules/@effect/ai/dist/esm/McpServer.js`
- `node_modules/@effect/ai/dist/cjs/McpServer.js`

Local Test UI Resource
- Added a minimal MCP App view and tool in `apps/server-mcp/src/index.ts`.
- The UI resource returns `resources/read` contents with `mimeType:
  "text/html;profile=mcp-app"`.
- The `HelloUi` tool sets `_meta.ui.resourceUri` and returns
  `structuredContent`.

References
- MCP Apps spec: `.reference/ext-apps/specification/2026-01-26/apps.mdx`
- Effect MCP schema reference: `.reference/effect/packages/ai/ai/src/McpSchema.ts`
- Effect MCP server reference: `.reference/effect/packages/ai/ai/src/McpServer.ts`
