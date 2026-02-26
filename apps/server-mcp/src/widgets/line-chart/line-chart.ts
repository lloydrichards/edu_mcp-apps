import { Effect, Schema } from "effect";
import { McpServer, Tool } from "effect/unstable/ai";
import { UiResourceMimeType, uiContent } from "../shared";

const LineChartUiResourceUri = "ui://examples/line-chart";

export const LineChartResourceLayer = McpServer.resource({
  uri: LineChartUiResourceUri,
  name: "Line Chart",
  description: "Line chart UI powered by sszvis",
  mimeType: UiResourceMimeType,
  content: uiContent(LineChartUiResourceUri, "line-chart/index.html", {
    prefersBorder: true,
    csp: {
      resourceDomains: ["https://cdn.jsdelivr.net"],
      connectDomains: ["https://cdn.jsdelivr.net"],
    },
  }),
});

const LineChartPoint = Schema.Struct({
  x: Schema.String.pipe(
    Schema.annotate({
      description:
        "ISO 8601 date string for the x-axis (YYYY-MM-DD or full timestamp)",
    }),
  ),
  y: Schema.NumberFromString,
  category: Schema.optional(Schema.String),
});

const LineChartProps = Schema.Struct({
  title: Schema.optional(Schema.String),
  xLabel: Schema.optional(Schema.String),
  yLabel: Schema.optional(Schema.String),
  ticks: Schema.optional(Schema.NumberFromString),
  stroke: Schema.optional(Schema.String),
  width: Schema.optional(Schema.NumberFromString),
  height: Schema.optional(Schema.NumberFromString),
  showPoints: Schema.optional(Schema.Boolean),
});

export const LineChartPayload = Schema.Struct({
  data: Schema.Array(LineChartPoint),
  props: Schema.optional(LineChartProps),
});

export const RenderLineChartTool = Tool.make("render_line_chart", {
  description: "Render a line chart from data points",
  parameters: LineChartPayload,
  success: LineChartPayload,
  failure: Schema.Never,
})
  .annotate(Tool.Title, "Line Chart")
  .annotate(Tool.Meta, {
    ui: {
      resourceUri: LineChartUiResourceUri,
    },
  });

export const renderLineChartHandler = (payload: typeof LineChartPayload.Type) =>
  Effect.succeed(payload);
