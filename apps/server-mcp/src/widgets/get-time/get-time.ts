import { Effect, Schema } from "effect";
import { McpServer, Tool } from "effect/unstable/ai";
import { UiResourceMimeType, uiContent } from "../shared";

const GetTimeUiResourceUri = "ui://examples/get-time";

export const GetTimeResourceLayer = McpServer.resource({
  uri: GetTimeUiResourceUri,
  name: "Get Time",
  description: "Get Time example UI",
  mimeType: UiResourceMimeType,
  content: uiContent(GetTimeUiResourceUri, "get-time/index.html", {
    prefersBorder: true,
    csp: {
      resourceDomains: ["https://cdn.jsdelivr.net"],
    },
  }),
});

export const GetTimeTool = Tool.make("get_time", {
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

export const getTimeHandler = () => Effect.sync(() => new Date().toISOString());
