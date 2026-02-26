import { Effect, Schema } from "effect";
import { McpServer, Tool } from "effect/unstable/ai";
import { UiResourceMimeType, uiContent } from "../shared";

const LitLabUiResourceUri = "ui://lit-lab";

export const LitLabResourceLayer = McpServer.resource({
  uri: LitLabUiResourceUri,
  name: "Lit Lab",
  description: "Lit component lab UI",
  mimeType: UiResourceMimeType,
  content: uiContent(
    LitLabUiResourceUri,
    import.meta.resolve("@repo/lit-lab/get_timer.html"),
    {
      prefersBorder: true,
    },
  ),
});

export const LitLabTool = Tool.make("render_lit_lab", {
  description: "Render the Lit component lab UI",
  parameters: Schema.Struct({}),
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
