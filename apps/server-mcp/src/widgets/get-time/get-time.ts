import { sep as pathSeparator } from "node:path";
import { Effect, Schema } from "effect";
import { Tool } from "effect/unstable/ai";
import { makeUiRenderTool, makeUiResource } from "../../service/McpAppService";

const GetTimeUiResourceUri = "ui://get-time";

const cwd = process.cwd();
const normalizedCwd = cwd.endsWith(pathSeparator)
  ? cwd
  : `${cwd}${pathSeparator}`;
const isDocker = process.env["MCP_DOCKER"] === "1";
const relativeGetTimePath = isDocker
  ? "./packages/lit-lab/dist/src/get_time/index.html"
  : "../../packages/lit-lab/dist/src/get_time/index.html";
const GetTimeHtmlUrl = new URL(relativeGetTimePath, `file://${normalizedCwd}`);
const GetTimeHtml = await Bun.file(GetTimeHtmlUrl).text();

export const GetTimeResourceLayer = makeUiResource(GetTimeUiResourceUri, {
  name: "Get Time",
  description: "Get time UI",
  html: GetTimeHtml,
  meta: {
    prefersBorder: false,
    csp: {
      resourceDomains: ["https://cdn.jsdelivr.net"],
    },
  },
});

export const RenderGetTimeTool = makeUiRenderTool(GetTimeUiResourceUri, {
  name: "render_get_time",
  title: "Get Time",
  description: "Render the get time UI",
  parameters: Tool.EmptyParams,
  success: Schema.String,
});

export const renderGetTimeHandler = () =>
  Effect.succeed("Get time ready. Use the UI to refresh.");

export const GetTimeTool = Tool.make("get_time", {
  description: "Returns the current server time",
  parameters: Tool.EmptyParams,
  success: Schema.String,
  failure: Schema.Never,
}).annotate(Tool.Title, "Get Time");

export const getTimeHandler = () => Effect.sync(() => new Date().toISOString());
