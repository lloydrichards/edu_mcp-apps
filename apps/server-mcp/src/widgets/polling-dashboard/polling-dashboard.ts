import { Effect, Schema } from "effect";
import { McpServer, Tool } from "effect/unstable/ai";
import { UiResourceMimeType, uiContent } from "../shared";

const PollingUiResourceUri = "ui://examples/polling-dashboard";

export const PollingDashboardResourceLayer = McpServer.resource({
  uri: PollingUiResourceUri,
  name: "Polling Dashboard",
  description: "Polling dashboard example UI",
  mimeType: UiResourceMimeType,
  content: uiContent(PollingUiResourceUri, "polling-dashboard/index.html"),
});

export const PollingDashboardTool = Tool.make("render_dashboard", {
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

const DashboardStats = Schema.Struct({
  timestamp: Schema.String,
  cpu: Schema.Number,
  memory: Schema.Number,
  requests: Schema.Number,
  status: Schema.Literals(["idle", "ok", "busy"]),
});

export const PollDashboardStatsTool = Tool.make("get_dashboard_stats", {
  description: "Returns latest dashboard stats for the polling UI",
  parameters: Schema.Struct({}),
  success: DashboardStats,
  failure: Schema.Never,
}).annotate(Tool.Meta, {
  ui: {
    visibility: ["app"],
  },
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
