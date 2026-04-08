import { Effect, Schema } from "effect";
import { Tool } from "effect/unstable/ai";
import {
  makeUiAppTool,
  makeUiRenderTool,
  makeUiResource,
} from "../../service/McpAppService";
import PollingDashboardHtmlSource from "./index.html" with { type: "text" };

const PollingUiResourceUri = "ui://examples/polling-dashboard";
const PollingDashboardHtml = PollingDashboardHtmlSource as unknown as string;

export const PollingDashboardResourceLayer = makeUiResource(
  PollingUiResourceUri,
  {
    name: "Polling Dashboard",
    description: "Polling dashboard example UI",
    html: PollingDashboardHtml,
  },
);

export const PollingDashboardTool = makeUiRenderTool(PollingUiResourceUri, {
  name: "render_dashboard",
  title: "Polling Dashboard",
  description: "Render the polling dashboard UI",
  parameters: Tool.EmptyParams,
  success: Schema.String,
});

const DashboardStats = Schema.Struct({
  timestamp: Schema.String,
  cpu: Schema.Number,
  memory: Schema.Number,
  requests: Schema.Number,
  status: Schema.Literals(["idle", "ok", "busy"]),
});

export const PollDashboardStatsTool = makeUiAppTool({
  name: "get_dashboard_stats",
  description: "Returns latest dashboard stats for the polling UI",
  parameters: Tool.EmptyParams,
  success: DashboardStats,
});

export const renderDashboardHandler = () =>
  Effect.succeed("Polling dashboard ready. Use dashboard/stats.");

export const getDashboardStatsHandler = () =>
  Effect.gen(function* () {
    const timestamp = yield* Effect.sync(() => new Date().toISOString());
    const cpu = yield* Effect.sync(() => Math.round(20 + Math.random() * 65));
    const memory = yield* Effect.sync(() =>
      Math.round(30 + Math.random() * 55),
    );
    const requests = yield* Effect.sync(() =>
      Math.round(120 + Math.random() * 880),
    );
    const status: "idle" | "ok" | "busy" =
      cpu > 75 ? "busy" : cpu < 35 ? "idle" : "ok";
    return { timestamp, cpu, memory, requests, status };
  });
