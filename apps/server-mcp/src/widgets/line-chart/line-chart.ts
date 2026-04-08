import { Effect, Schema } from "effect";
import { makeUiRenderTool, makeUiResource } from "../../service/McpAppService";
import LineChartHtmlSource from "./index.html" with { type: "text" };

const LineChartUiResourceUri = "ui://examples/line-chart";
const LineChartHtml = LineChartHtmlSource as unknown as string;

export const LineChartResourceLayer = makeUiResource(LineChartUiResourceUri, {
  name: "Line Chart",
  description: "Line chart UI powered by sszvis",
  html: LineChartHtml,
  meta: {
    prefersBorder: true,
    csp: {
      resourceDomains: ["https://cdn.jsdelivr.net"],
      connectDomains: ["https://cdn.jsdelivr.net"],
    },
  },
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

export const RenderLineChartTool = makeUiRenderTool(LineChartUiResourceUri, {
  name: "render_line_chart",
  title: "Line Chart",
  description: "Render a line chart from data points",
  parameters: LineChartPayload,
  success: LineChartPayload,
});

export const renderLineChartHandler = (payload: typeof LineChartPayload.Type) =>
  Effect.succeed(payload);
