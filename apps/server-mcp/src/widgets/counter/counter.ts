import { sep as pathSeparator } from "node:path";
import { Effect, Schema } from "effect";
import { Tool } from "effect/unstable/ai";
import { makeUiRenderTool, makeUiResource } from "../../service/McpAppService";

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
const CounterHtml = await Bun.file(CounterHtmlUrl).text();

export const CounterResourceLayer = makeUiResource(CounterUiResourceUri, {
  name: "Counter",
  description: "Counter widget UI",
  html: CounterHtml,
  meta: {
    prefersBorder: false,
    csp: {
      resourceDomains: ["https://cdn.jsdelivr.net"],
    },
  },
});

export const CounterTool = makeUiRenderTool(CounterUiResourceUri, {
  name: "render_counter",
  title: "Counter",
  description: "Render the counter widget UI",
  parameters: Tool.EmptyParams,
  success: Schema.String,
});

export const renderCounterHandler = () =>
  Effect.succeed("Counter ready. Use the UI to increment and decrement.");
