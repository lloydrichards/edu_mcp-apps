import { sep as pathSeparator } from "node:path";
import { Effect, Schema } from "effect";
import { McpServer, Tool } from "effect/unstable/ai";
import { EmptyParams, UiResourceMimeType, uiContent } from "../shared";

const CounterUiResourceUri = "ui://lit-lab/counter";

const cwd = process.cwd();
const normalizedCwd = cwd.endsWith(pathSeparator)
  ? cwd
  : `${cwd}${pathSeparator}`;
const isDocker = process.env["MCP_DOCKER"] === "1";
const relativeCounterPath = isDocker
  ? "./packages/lit-lab/dist/src/counter/index.html"
  : "../../packages/lit-lab/dist/src/counter/index.html";
const CounterHtmlUrl = new URL(relativeCounterPath, `file://${normalizedCwd}`);

export const CounterResourceLayer = McpServer.resource({
  uri: CounterUiResourceUri,
  name: "Counter",
  description: "Counter widget UI",
  mimeType: UiResourceMimeType,
  content: uiContent(CounterUiResourceUri, CounterHtmlUrl, {
    prefersBorder: false,
    csp: {
      resourceDomains: ["https://cdn.jsdelivr.net"],
    },
  }),
});

export const CounterTool = Tool.make("render_counter", {
  description: "Render the counter widget UI",
  parameters: EmptyParams,
  success: Schema.String,
  failure: Schema.Never,
})
  .annotate(Tool.Title, "Counter")
  .annotate(Tool.Meta, {
    ui: {
      resourceUri: CounterUiResourceUri,
    },
  });

export const renderCounterHandler = () =>
  Effect.succeed("Counter ready. Use the UI to increment and decrement.");
