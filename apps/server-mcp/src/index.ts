import { BunHttpServer, BunRuntime, BunServices } from "@effect/platform-bun";
import { Config, Effect, Layer } from "effect";
import { McpServer, Toolkit } from "effect/unstable/ai";
import { HttpRouter, HttpServer } from "effect/unstable/http";
import {
  BarChartResourceLayer,
  RenderBarChartTool,
  renderBarChartHandler,
} from "./widgets/bar-chart/bar-chart";
import {
  CounterResourceLayer,
  CounterTool,
  renderCounterHandler,
} from "./widgets/counter/counter";
import {
  GetTimeResourceLayer,
  GetTimeTool,
  getTimeHandler,
  RenderGetTimeTool,
  renderGetTimeHandler,
} from "./widgets/get-time/get-time";
import {
  LineChartResourceLayer,
  RenderLineChartTool,
  renderLineChartHandler,
} from "./widgets/line-chart/line-chart";

import {
  LogExplorerResourceLayer,
  LogExplorerStateLayer,
  LogExplorerTool,
  PollLogEntriesTool,
  pollLogEntriesHandler,
  renderLogExplorerHandler,
} from "./widgets/log-explorer/log-explorer";
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
  PollingDashboardResourceLayer,
  PomodoroTimerResourceLayer,
  LineChartResourceLayer,
  BarChartResourceLayer,
  LogExplorerResourceLayer,
  GetTimeResourceLayer,
  CounterResourceLayer,
);

const UiToolkit = Toolkit.make(
  PollingDashboardTool,
  PollDashboardStatsTool,
  PomodoroTimerTool,
  RenderLineChartTool,
  RenderBarChartTool,
  LogExplorerTool,
  PollLogEntriesTool,
  RenderGetTimeTool,
  CounterTool,
  GetTimeTool,
);

const UiToolLayer = McpServer.toolkit(UiToolkit).pipe(
  Layer.provide(
    UiToolkit.toLayer({
      render_dashboard: renderDashboardHandler,
      get_dashboard_stats: getDashboardStatsHandler,
      render_timer: renderTimerHandler,
      render_line_chart: renderLineChartHandler,
      render_bar_chart: renderBarChartHandler,
      render_log_explorer: renderLogExplorerHandler,
      poll_log_entries: pollLogEntriesHandler,
      render_get_time: renderGetTimeHandler,
      render_counter: renderCounterHandler,
      get_time: getTimeHandler,
    }),
  ),
);

// Define Live API
const McpLive = Layer.mergeAll(
  ResourceLayer,
  UiToolLayer,
  LogExplorerStateLayer,
  McpServer.serverExtensions({
    "io.modelcontextprotocol/ui": {},
  }),
);

const ServerConfig = Config.all({
  port: Config.number("MCP_PORT").pipe(Config.withDefault(9009)),
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

BunRuntime.runMain(
  Layer.launch(HttpLive).pipe(Effect.scoped, Effect.provide(BunServices.layer)),
);
