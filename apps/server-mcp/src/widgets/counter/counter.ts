import CounterHtmlSource from "@repo/lit-lab/counter.html" with {
  type: "text",
};
import { Effect, Schema } from "effect";
import { Tool } from "effect/unstable/ai";
import { makeUiRenderTool, makeUiResource } from "../../service/McpAppService";

const CounterUiResourceUri = "ui://lit-lab/counter";
const CounterHtml = CounterHtmlSource as unknown as string;

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
