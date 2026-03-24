import { sep as pathSeparator } from "node:path";
import { Effect, Schema } from "effect";
import { McpServer, Tool } from "effect/unstable/ai";
import { UiResourceMimeType, uiContent } from "../shared";

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

export const GetTimeResourceLayer = McpServer.resource({
  uri: GetTimeUiResourceUri,
  name: "Get Time",
  description: "Get time UI",
  mimeType: UiResourceMimeType,
  content: uiContent(GetTimeUiResourceUri, GetTimeHtmlUrl, {
    prefersBorder: false,
    csp: {
      resourceDomains: ["https://cdn.jsdelivr.net"],
    },
  }),
});

export const RenderGetTimeTool = Tool.make("render_get_time", {
  description: "Render the get time UI",
  parameters: Tool.EmptyParams,
  success: Schema.String,
  failure: Schema.Never,
})
  .annotate(Tool.Title, "Get Time")
  .annotate(Tool.Meta, {
    ui: {
      resourceUri: GetTimeUiResourceUri,
    },
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
