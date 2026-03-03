import { sep as pathSeparator } from "node:path";
import { Effect, Schema } from "effect";
import { McpServer, Tool } from "effect/unstable/ai";
import { EmptyParams, UiResourceMimeType, uiContent } from "../shared";

const LitLabUiResourceUri = "ui://lit-lab";

const cwd = process.cwd();
const normalizedCwd = cwd.endsWith(pathSeparator)
  ? cwd
  : `${cwd}${pathSeparator}`;
const relativeLitLabPath = cwd.endsWith(
  `${pathSeparator}apps${pathSeparator}server-mcp`,
)
  ? "../../packages/lit-lab/dist/get_timer.html"
  : cwd.endsWith(`${pathSeparator}apps`)
    ? "../packages/lit-lab/dist/get_timer.html"
    : cwd.endsWith(`${pathSeparator}server-mcp`)
      ? "../packages/lit-lab/dist/get_timer.html"
      : "packages/lit-lab/dist/get_timer.html";
const LitLabHtmlUrl = new URL(relativeLitLabPath, `file://${normalizedCwd}`);

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
