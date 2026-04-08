import { Effect, Schema } from "effect";
import { Tool } from "effect/unstable/ai";
import { makeUiRenderTool, makeUiResource } from "../../service/McpAppService";
import PomodoroHtmlSource from "./index.html" with { type: "text" };

const PomodoroUiResourceUri = "ui://examples/pomodoro-timer";
const PomodoroHtml = PomodoroHtmlSource as unknown as string;

export const PomodoroTimerResourceLayer = makeUiResource(
  PomodoroUiResourceUri,
  {
    name: "Pomodoro Timer",
    description: "Pomodoro timer UI built with web components",
    html: PomodoroHtml,
    meta: {
      prefersBorder: true,
      csp: {
        resourceDomains: ["https://cdn.jsdelivr.net"],
      },
    },
  },
);

export const PomodoroTimerTool = makeUiRenderTool(PomodoroUiResourceUri, {
  name: "render_timer",
  title: "Pomodoro Timer",
  description: "Render the Pomodoro timer UI",
  parameters: Tool.EmptyParams,
  success: Schema.String,
});

export const renderTimerHandler = () =>
  Effect.succeed("Pomodoro timer ready. Use the UI to start.");
