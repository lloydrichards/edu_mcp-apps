import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { Config, Effect, Layer, Schema } from "effect";
import { McpServer, Tool, Toolkit } from "effect/unstable/ai";
import { HttpRouter, HttpServer } from "effect/unstable/http";

const UiResourceMimeType = "text/html;profile=mcp-app";
const GetTimeUiResourceUri = "ui://examples/get-time";
const PollingUiResourceUri = "ui://examples/polling-dashboard";
const PomodoroUiResourceUri = "ui://examples/pomodoro-timer";
const LineChartUiResourceUri = "ui://examples/line-chart";
const BarChartUiResourceUri = "ui://examples/bar-chart";
const UiBaseUrl = new URL("./ui/", import.meta.url);

const uiContent = (
  uri: string,
  fileName: string,
  uiMeta: {
    prefersBorder?: boolean;
    csp?: {
      resourceDomains?: string[];
      connectDomains?: string[];
      frameDomains?: string[];
      baseUriDomains?: string[];
    };
  } = { prefersBorder: true },
) =>
  Effect.gen(function* () {
    const html = yield* Effect.tryPromise({
      try: () => Bun.file(new URL(fileName, UiBaseUrl)).text(),
      catch: (error) =>
        new Error(`Failed to load UI resource ${fileName}: ${String(error)}`),
    });
    return {
      contents: [
        {
          uri,
          mimeType: UiResourceMimeType,
          text: html,
          _meta: {
            ui: {
              ...uiMeta,
            },
          },
        },
      ],
    };
  });

// Define Resources
const ResourceLayer = Layer.mergeAll(
  McpServer.resource({
    uri: GetTimeUiResourceUri,
    name: "Get Time",
    description: "Get Time example UI",
    mimeType: UiResourceMimeType,
    content: uiContent(GetTimeUiResourceUri, "get-time.html"),
  }),
  McpServer.resource({
    uri: PollingUiResourceUri,
    name: "Polling Dashboard",
    description: "Polling dashboard example UI",
    mimeType: UiResourceMimeType,
    content: uiContent(PollingUiResourceUri, "polling-dashboard.html"),
  }),
  McpServer.resource({
    uri: PomodoroUiResourceUri,
    name: "Pomodoro Timer",
    description: "Pomodoro timer UI built with web components",
    mimeType: UiResourceMimeType,
    content: uiContent(PomodoroUiResourceUri, "pomodoro-timer.html", {
      prefersBorder: true,
      csp: {
        resourceDomains: ["https://cdn.jsdelivr.net"],
      },
    }),
  }),
  McpServer.resource({
    uri: LineChartUiResourceUri,
    name: "Line Chart",
    description: "Line chart UI powered by sszvis",
    mimeType: UiResourceMimeType,
    content: uiContent(LineChartUiResourceUri, "line-chart.html", {
      prefersBorder: true,
      csp: {
        resourceDomains: ["https://cdn.jsdelivr.net"],
        connectDomains: ["https://cdn.jsdelivr.net"],
      },
    }),
  }),
  McpServer.resource({
    uri: BarChartUiResourceUri,
    name: "Bar Chart",
    description: "Bar chart UI powered by sszvis",
    mimeType: UiResourceMimeType,
    content: uiContent(BarChartUiResourceUri, "bar-chart.html", {
      prefersBorder: true,
      csp: {
        resourceDomains: ["https://cdn.jsdelivr.net"],
        connectDomains: ["https://cdn.jsdelivr.net"],
      },
    }),
  }),
);

const DashboardStats = Schema.Struct({
  timestamp: Schema.String,
  cpu: Schema.Number,
  memory: Schema.Number,
  requests: Schema.Number,
  status: Schema.Literals(["idle", "ok", "busy"]),
});

const LineChartNumber = Schema.Union([Schema.Number, Schema.NumberFromString]);

const LineChartPoint = Schema.Struct({
  x: LineChartNumber,
  y: LineChartNumber,
  category: Schema.optional(Schema.String),
});

const LineChartProps = Schema.Struct({
  title: Schema.optional(Schema.String),
  xLabel: Schema.optional(Schema.String),
  yLabel: Schema.optional(Schema.String),
  ticks: Schema.optional(LineChartNumber),
  stroke: Schema.optional(Schema.String),
  width: Schema.optional(LineChartNumber),
  height: Schema.optional(LineChartNumber),
  showPoints: Schema.optional(Schema.Boolean),
});

const LineChartPayload = Schema.Struct({
  data: Schema.Array(LineChartPoint),
  props: Schema.optional(LineChartProps),
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

const BarChartPayload = Schema.Struct({
  data: Schema.Array(BarChartDatum),
  props: Schema.optional(BarChartProps),
});

const GetTimeTool = Tool.make("get_time", {
  description: "Returns the current server time",
  parameters: Schema.Struct({}),
  success: Schema.String,
  failure: Schema.Never,
})
  .annotate(Tool.Title, "Get Time")
  .annotate(Tool.Meta, {
    ui: {
      resourceUri: GetTimeUiResourceUri,
    },
  });

const PollingDashboardTool = Tool.make("render_dashboard", {
  description: "Render the polling dashboard UI",
  parameters: Schema.Struct({}),
  success: Schema.String,
  failure: Schema.Never,
})
  .annotate(Tool.Title, "Polling Dashboard")
  .annotate(Tool.Meta, {
    ui: {
      resourceUri: PollingUiResourceUri,
    },
  });

const PomodoroTimerTool = Tool.make("render_timer", {
  description: "Render the Pomodoro timer UI",
  parameters: Schema.Struct({}),
  success: Schema.String,
  failure: Schema.Never,
})
  .annotate(Tool.Title, "Pomodoro Timer")
  .annotate(Tool.Meta, {
    ui: {
      resourceUri: PomodoroUiResourceUri,
    },
  });

const RenderLineChartTool = Tool.make("render_line_chart", {
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

const RenderBarChartTool = Tool.make("render_bar_chart", {
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

const PollDashboardStatsTool = Tool.make("get_dashboard_stats", {
  description: "Returns latest dashboard stats for the polling UI",
  parameters: Schema.Struct({}),
  success: DashboardStats,
  failure: Schema.Never,
}).annotate(Tool.Meta, {
  ui: {
    visibility: ["app"],
  },
});

const UiToolkit = Toolkit.make(
  GetTimeTool,
  PollingDashboardTool,
  PollDashboardStatsTool,
  PomodoroTimerTool,
  RenderLineChartTool,
  RenderBarChartTool,
);

const UiToolLayer = McpServer.toolkit(UiToolkit).pipe(
  Layer.provide(
    UiToolkit.toLayer({
      get_time: () => Effect.sync(() => new Date().toISOString()),
      render_dashboard: () =>
        Effect.succeed("Polling dashboard ready. Use dashboard/stats."),
      get_dashboard_stats: () =>
        Effect.gen(function* () {
          const timestamp = yield* Effect.sync(() => new Date().toISOString());
          const cpu = yield* Effect.sync(() =>
            Math.round(20 + Math.random() * 65),
          );
          const memory = yield* Effect.sync(() =>
            Math.round(30 + Math.random() * 55),
          );
          const requests = yield* Effect.sync(() =>
            Math.round(120 + Math.random() * 880),
          );
          const status = cpu > 75 ? "busy" : cpu < 35 ? "idle" : "ok";
          return { timestamp, cpu, memory, requests, status };
        }),
      render_timer: () =>
        Effect.succeed("Pomodoro timer ready. Use the UI to start."),
      render_line_chart: (payload) => Effect.succeed(payload),
      render_bar_chart: (payload) => Effect.succeed(payload),
    }),
  ),
);

// Define Live API
const McpLive = Layer.mergeAll(ResourceLayer, UiToolLayer);

const ServerConfig = Config.all({
  port: Config.number("MCP_PORT").pipe(Config.withDefault(() => 9009)),
});

const McpRouter = McpServer.layerHttp({
  name: "Edu MCP App Server",
  version: "0.2.0",
  path: "/mcp",
}).pipe(
  Layer.provideMerge(McpLive),
  Layer.provide(
    HttpRouter.cors({
      allowedOrigins: ["*"],
      allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "mcp-protocol-version"],
      credentials: false,
    }),
  ),
);

const HttpLive = HttpRouter.serve(McpRouter).pipe(
  HttpServer.withLogAddress,
  Layer.provideMerge(BunHttpServer.layerConfig(ServerConfig)),
);

BunRuntime.runMain(Layer.launch(HttpLive).pipe(Effect.scoped));
