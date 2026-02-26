import { Effect, Schema } from "effect";
import { McpServer, Tool } from "effect/unstable/ai";
import { UiResourceMimeType, uiContent } from "../shared";

const PomodoroUiResourceUri = "ui://examples/pomodoro-timer";

export const PomodoroTimerResourceLayer = McpServer.resource({
  uri: PomodoroUiResourceUri,
  name: "Pomodoro Timer",
  description: "Pomodoro timer UI built with web components",
  mimeType: UiResourceMimeType,
  content: uiContent(PomodoroUiResourceUri, "pomodoro-timer/index.html", {
    prefersBorder: true,
    csp: {
      resourceDomains: ["https://cdn.jsdelivr.net"],
    },
  }),
});

export const PomodoroTimerTool = Tool.make("render_timer", {
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

export const renderTimerHandler = () =>
  Effect.succeed("Pomodoro timer ready. Use the UI to start.");
