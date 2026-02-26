import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { Config, Effect, Layer } from "effect";
import { McpServer, Toolkit } from "effect/unstable/ai";
import { HttpRouter, HttpServer } from "effect/unstable/http";
import {
  BarChartResourceLayer,
  RenderBarChartTool,
  renderBarChartHandler,
} from "./widgets/bar-chart/bar-chart";
import {
  GetTimeResourceLayer,
  GetTimeTool,
  getTimeHandler,
} from "./widgets/get-time/get-time";
import {
  LineChartResourceLayer,
  RenderLineChartTool,
  renderLineChartHandler,
} from "./widgets/line-chart/line-chart";
import {
  getDashboardStatsHandler,
  PollDashboardStatsTool,
  PollingDashboardResourceLayer,
  PollingDashboardTool,
  renderDashboardHandler,
} from "./widgets/polling-dashboard/polling-dashboard";
import {
  PomodoroTimerResourceLayer,
  PomodoroTimerTool,
  renderTimerHandler,
} from "./widgets/pomodoro-timer/pomodoro-timer";

// Define Resources
const ResourceLayer = Layer.mergeAll(
  GetTimeResourceLayer,
  PollingDashboardResourceLayer,
  PomodoroTimerResourceLayer,
  LineChartResourceLayer,
  BarChartResourceLayer,
);

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
      get_time: getTimeHandler,
      render_dashboard: renderDashboardHandler,
      get_dashboard_stats: getDashboardStatsHandler,
      render_timer: renderTimerHandler,
      render_line_chart: renderLineChartHandler,
      render_bar_chart: renderBarChartHandler,
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
