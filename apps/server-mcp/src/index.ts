import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { Config, Effect, Layer, Schema } from "effect";
import { McpServer, Tool, Toolkit } from "effect/unstable/ai";
import { HttpRouter, HttpServer } from "effect/unstable/http";

const UiResourceMimeType = "text/html;profile=mcp-app";
const GetTimeUiResourceUri = "ui://examples/get-time";
const PollingUiResourceUri = "ui://examples/polling-dashboard";
const PomodoroUiResourceUri = "ui://examples/pomodoro-timer";
const LineChartUiResourceUri = "ui://examples/line-chart";
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
    uri: "app://primer",
    name: "Primer Document",
    description: "Documentation for the application",
    content: Effect.succeed(
      "This is a sample primer document to demonstrate MCP server capabilities.",
    ),
  }),
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
);

// Define Prompts
const PromptLayer = Layer.mergeAll(
  McpServer.prompt({
    name: "Hello Prompt",
    description: "A simple greeting prompt",
    parameters: {
      name: Schema.String,
    },
    content: ({ name }) =>
      Effect.succeed(
        `Hello, ${name}! Welcome to the MCP server demonstration.`,
      ),
  }),
  // You can add more prompts here
);

// Define Toolkit
class AiTools extends Toolkit.make(
  Tool.make("GetDadJoke", {
    description: "Get a hilarious dad joke from the ICanHazDadJoke API",
    success: Schema.String,
    failure: Schema.Never,
    parameters: Schema.Struct({
      searchTerm: Schema.String.annotate({
        description: "The search term to use to find dad jokes",
      }),
    }),
  }),
) {}

const ToolLayer = McpServer.toolkit(AiTools).pipe(
  Layer.provide(
    AiTools.toLayer({
      GetDadJoke: ({ searchTerm }, _context) =>
        Effect.succeed(
          `Here's a dad joke about ${searchTerm}: Why don't ${searchTerm}s ever get lost? Because they always follow the map!`,
        ),
    }),
  ),
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
});

const LineChartProps = Schema.Struct({
  title: Schema.optional(Schema.String),
  xLabel: Schema.optional(Schema.String),
  yLabel: Schema.optional(Schema.String),
  stroke: Schema.optional(Schema.String),
  width: Schema.optional(LineChartNumber),
  height: Schema.optional(LineChartNumber),
  showPoints: Schema.optional(Schema.Boolean),
});

const LineChartPayload = Schema.Struct({
  data: Schema.Array(LineChartPoint),
  props: Schema.optional(LineChartProps),
});

const GetTimeTool = Tool.make("GetTime", {
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

const PollingDashboardTool = Tool.make("PollingDashboard", {
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

const PomodoroTimerTool = Tool.make("PomodoroTimer", {
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

const RenderLineChartTool = Tool.make("RenderLineChart", {
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

const PollDashboardStatsTool = Tool.make("PollDashboardStats", {
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
);

const UiToolLayer = McpServer.toolkit(UiToolkit).pipe(
  Layer.provide(
    UiToolkit.toLayer({
      GetTime: () => Effect.sync(() => new Date().toISOString()),
      PollingDashboard: () =>
        Effect.succeed("Polling dashboard ready. Use PollDashboardStats."),
      PollDashboardStats: () =>
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
      PomodoroTimer: () =>
        Effect.succeed("Pomodoro timer ready. Use the UI to start."),
      RenderLineChart: (payload) => Effect.succeed(payload),
    }),
  ),
);

// Define Live API
const McpLive = Layer.mergeAll(
  ResourceLayer,
  PromptLayer,
  ToolLayer,
  UiToolLayer,
);

const ServerConfig = Config.all({
  port: Config.number("MCP_PORT").pipe(Config.withDefault(() => 9009)),
});

const McpRouter = McpServer.layerHttp({
  name: "BEVR MCP Server",
  version: "0.1.0",
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
