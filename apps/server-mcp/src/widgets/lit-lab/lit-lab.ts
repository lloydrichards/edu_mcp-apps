import { Effect, Schema } from "effect";
import { McpServer, Tool } from "effect/unstable/ai";
import { EmptyParams, UiResourceMimeType, uiContent } from "../shared";

const LitLabUiResourceUri = "ui://lit-lab";

const LitLabHtmlUrl = new URL(
  "../../../../../packages/lit-lab/dist/get_timer.html",
  import.meta.url,
);

export const LitLabResourceLayer = McpServer.resource({
  uri: LitLabUiResourceUri,
  name: "Lit Lab",
  description: "Lit component lab UI",
  mimeType: UiResourceMimeType,
  content: uiContent(LitLabUiResourceUri, LitLabHtmlUrl, {
    prefersBorder: true,
    csp: {
      resourceDomains: ["https://cdn.jsdelivr.net"],
    },
  }),
});

export const LitLabTool = Tool.make("render_lit_lab", {
  description: "Render the Lit component lab UI",
  parameters: EmptyParams,
  success: Schema.String,
  failure: Schema.Never,
})
  .annotate(Tool.Title, "Lit Lab")
  .annotate(Tool.Meta, {
    ui: {
      resourceUri: LitLabUiResourceUri,
    },
  });

export const renderLitLabHandler = () =>
  Effect.succeed("Lit lab ready. Use the UI to explore components.");
