import { Effect, Schema } from "effect";
import { makeUiRenderTool, makeUiResource } from "../../service/McpAppService";
import BarChartHtmlSource from "./index.html" with { type: "text" };

const BarChartUiResourceUri = "ui://examples/bar-chart";
const BarChartHtml = BarChartHtmlSource as unknown as string;

export const BarChartResourceLayer = makeUiResource(BarChartUiResourceUri, {
  name: "Bar Chart",
  description: "Bar chart UI powered by sszvis",
  html: BarChartHtml,
  meta: {
    prefersBorder: true,
    csp: {
      resourceDomains: ["https://cdn.jsdelivr.net"],
      connectDomains: ["https://cdn.jsdelivr.net"],
    },
  },
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

export const RenderBarChartTool = makeUiRenderTool(BarChartUiResourceUri, {
  name: "render_bar_chart",
  title: "Bar Chart",
  description: "Render a categorical bar chart",
  parameters: BarChartPayload,
  success: BarChartPayload,
});

export const renderBarChartHandler = (payload: typeof BarChartPayload.Type) =>
  Effect.succeed(payload);
