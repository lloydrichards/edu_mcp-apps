import { Effect, Schema } from "effect";
import { McpServer, Tool } from "effect/unstable/ai";
import { UiResourceMimeType, uiContent } from "../shared";

const BarChartUiResourceUri = "ui://examples/bar-chart";

export const BarChartResourceLayer = McpServer.resource({
  uri: BarChartUiResourceUri,
  name: "Bar Chart",
  description: "Bar chart UI powered by sszvis",
  mimeType: UiResourceMimeType,
  content: uiContent(BarChartUiResourceUri, "bar-chart/index.html", {
    prefersBorder: true,
    csp: {
      resourceDomains: ["https://cdn.jsdelivr.net"],
      connectDomains: ["https://cdn.jsdelivr.net"],
    },
  }),
});

const BarChartNumber = Schema.Union([Schema.Number, Schema.NumberFromString]);

const BarChartDatum = Schema.Struct({
  category: Schema.String,
  value: BarChartNumber,
});

const BarChartProps = Schema.Struct({
  title: Schema.optional(Schema.String),
  valueLabel: Schema.optional(Schema.String),
  maxWidth: Schema.optional(BarChartNumber),
});

export const BarChartPayload = Schema.Struct({
  data: Schema.Array(BarChartDatum),
  props: Schema.optional(BarChartProps),
});

export const RenderBarChartTool = Tool.make("render_bar_chart", {
  description: "Render a categorical bar chart",
  parameters: BarChartPayload,
  success: BarChartPayload,
  failure: Schema.Never,
})
  .annotate(Tool.Title, "Bar Chart")
  .annotate(Tool.Meta, {
    ui: {
      resourceUri: BarChartUiResourceUri,
    },
  });

export const renderBarChartHandler = (payload: typeof BarChartPayload.Type) =>
  Effect.succeed(payload);
