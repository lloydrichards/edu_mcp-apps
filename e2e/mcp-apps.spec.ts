import { expect, test } from "@playwright/test";

test("existing tools and widgets work through MCP and the Apps handshake", async ({
  page,
}) => {
  let session = "";
  let id = 0;
  const rpc = async (method: string, params: object = {}) => {
    const response = await fetch("http://localhost:9010/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        ...(session
          ? { "mcp-session-id": session, "mcp-protocol-version": "2025-06-18" }
          : {}),
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
    });
    expect(response.ok).toBe(true);
    session = response.headers.get("mcp-session-id") ?? session;
    const message = await response.json();
    expect(message.error).toBeUndefined();
    return message.result;
  };
  const initialized = await rpc("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: { extensions: { "io.modelcontextprotocol/ui": {} } },
    clientInfo: { name: "repo-smoke", version: "1.0.0" },
  });
  expect(initialized.protocolVersion).toBe("2025-06-18");
  await fetch("http://localhost:9010/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "mcp-session-id": session,
      "mcp-protocol-version": "2025-06-18",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "notifications/initialized",
    }),
  });
  const { tools } = await rpc("tools/list");
  expect(tools).toHaveLength(10);
  const { resources } = await rpc("resources/list");
  expect(resources).toHaveLength(7);
  await page.exposeFunction("callTool", (params: object) =>
    rpc("tools/call", params),
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const resource of resources) {
    const { contents } = await rpc("resources/read", { uri: resource.uri });
    expect(contents[0].mimeType).toBe("text/html;profile=mcp-app");
    expect(contents[0].text).not.toMatch(/from\s*["']\.\//);
    const tool = tools.find(
      (entry: { _meta?: { ui?: { resourceUri?: string } } }) =>
        entry._meta?.ui?.resourceUri === resource.uri,
    );
    expect(tool).toBeDefined();
    const args =
      tool.name === "render_bar_chart"
        ? { data: [{ category: "Alpha", value: 10 }] }
        : tool.name === "render_line_chart"
          ? {
              data: [
                { x: "2026-10-01", y: "10" },
                { x: "2026-10-02", y: "20" },
              ],
            }
          : {};
    const result = await rpc("tools/call", {
      name: tool.name,
      arguments: args,
    });
    expect(result.isError).not.toBe(true);
    expect(result.content.length).toBeGreaterThan(0);
    await page.goto("about:blank");
    await page.evaluate(
      ({ html, args, result }) => {
        const frame = document.createElement("iframe");
        frame.style.cssText = "width:1000px;height:800px";
        frame.srcdoc = html;
        window.addEventListener("message", async (event) => {
          if (event.source !== frame.contentWindow) return;
          const message = event.data;
          if (message.method === "ui/initialize") {
            frame.contentWindow?.postMessage(
              {
                jsonrpc: "2.0",
                id: message.id,
                result: {
                  protocolVersion: "2026-01-26",
                  hostInfo: { name: "smoke-host", version: "1.0.0" },
                  hostCapabilities: { serverTools: {} },
                  hostContext: {
                    theme: "light",
                    displayMode: "inline",
                    safeAreaInsets: { top: 4, right: 6, bottom: 4, left: 6 },
                  },
                },
              },
              "*",
            );
          } else if (message.method === "ui/notifications/initialized") {
            document.body.dataset.initialized = "true";
            frame.contentWindow?.postMessage(
              {
                jsonrpc: "2.0",
                method: "ui/notifications/tool-input",
                params: { arguments: args },
              },
              "*",
            );
            frame.contentWindow?.postMessage(
              {
                jsonrpc: "2.0",
                method: "ui/notifications/tool-result",
                params: result,
              },
              "*",
            );
          } else if (message.method === "tools/call") {
            const callTool = Reflect.get(window, "callTool");
            const toolResult = await callTool(message.params);
            frame.contentWindow?.postMessage(
              { jsonrpc: "2.0", id: message.id, result: toolResult },
              "*",
            );
          }
        });
        document.body.append(frame);
      },
      { html: contents[0].text, args, result },
    );
    await expect(page.locator("body")).toHaveAttribute(
      "data-initialized",
      "true",
    );
    const view = page.frameLocator("iframe");
    await expect(view.locator("body")).toHaveCSS("padding-top", "4px");
    if (tool.name === "render_counter") {
      await view.locator("#increment").click();
      await expect(view.locator("#count")).toHaveText("1");
      await view.locator("#decrement").click();
      await expect(view.locator("#count")).toHaveText("0");
    } else if (tool.name === "render_get_time") {
      await expect(view.locator("get-time-card .status")).toHaveText("Updated");
      await view.getByText("Refresh", { exact: true }).click();
      await expect(view.locator("get-time-card .status")).toHaveText("Updated");
    } else if (tool.name === "render_dashboard") {
      await expect(view.locator("#hint")).toHaveText("Live stats updating");
    } else if (tool.name === "render_log_explorer") {
      await expect(view.locator("#stream .line").first()).toBeVisible();
    } else if (
      tool.name === "render_bar_chart" ||
      tool.name === "render_line_chart"
    ) {
      await expect(view.locator("svg").first()).toBeVisible();
    } else if (tool.name === "render_timer") {
      await expect(view.locator("#status")).toHaveText("Ready.");
      await view.locator("#startBtn").click();
      await expect(view.locator("#status")).toHaveText("Focus time.");
      await view.locator("#pauseBtn").click();
      await expect(view.locator("#status")).toHaveText("Paused.");
    }
    expect(errors, resource.uri).toEqual([]);
  }
  await fetch("http://localhost:9010/mcp", {
    method: "DELETE",
    headers: {
      "mcp-session-id": session,
      "mcp-protocol-version": "2025-06-18",
    },
  });
});

for (const protocolVersion of ["2025-11-25"]) {
  test(`negotiates ${protocolVersion} and calls get_time`, async () => {
    const initialize = await fetch("http://localhost:9010/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion,
          capabilities: {},
          clientInfo: { name: "protocol-smoke", version: "1.0.0" },
        },
      }),
    });
    expect(initialize.ok).toBe(true);
    const result = await initialize.json();
    expect(result.result.protocolVersion).toBe(protocolVersion);
    const session = initialize.headers.get("mcp-session-id");
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "mcp-protocol-version": protocolVersion,
      ...(session ? { "mcp-session-id": session } : {}),
    };
    if (session) {
      await fetch("http://localhost:9010/mcp", {
        method: "POST",
        headers,
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "notifications/initialized",
        }),
      });
    }
    const call = await fetch("http://localhost:9010/mcp", {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "get_time", arguments: {} },
      }),
    });
    expect(call.ok).toBe(true);
    const reply = await call.json();
    expect(reply.error).toBeUndefined();
    expect(reply.result.isError).not.toBe(true);
    expect(reply.result.content[0].text).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    if (session) {
      const terminated = await fetch("http://localhost:9010/mcp", {
        method: "DELETE",
        headers,
      });
      expect(terminated.status).toBe(204);
    } else {
      expect(protocolVersion).toBe("2026-07-28");
    }
  });
}

test("calls get_time without a session using MCP 2026-07-28", async () => {
  const response = await fetch("http://localhost:9010/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "mcp-protocol-version": "2026-07-28",
      "mcp-method": "tools/call",
      "mcp-name": "get_time",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "get_time",
        arguments: {},
        _meta: {
          "io.modelcontextprotocol/protocolVersion": "2026-07-28",
          "io.modelcontextprotocol/clientCapabilities": {},
        },
      },
    }),
  });
  expect(response.ok).toBe(true);
  expect(response.headers.get("mcp-session-id")).toBeNull();
  const reply = await response.json();
  expect(reply.error).toBeUndefined();
  expect(reply.result.isError).not.toBe(true);
  expect(JSON.parse(reply.result.content[0].text)).toMatch(
    /^\d{4}-\d{2}-\d{2}T/,
  );
});
