import { Effect, Layer, Schema, ServiceMap } from "effect";
import { McpServer, Tool } from "effect/unstable/ai";

const UiResourceMimeType = "text/html;profile=mcp-app";

type UiMeta = {
  prefersBorder?: boolean;
  csp?: {
    resourceDomains?: string[];
    connectDomains?: string[];
    frameDomains?: string[];
    baseUriDomains?: string[];
  };
  domain?: string;
};

type UiResourceSpec = {
  name: string;
  description: string;
  html: string;
  meta?: UiMeta;
};

export const makeUiResource = (uri: string, spec: UiResourceSpec) =>
  McpServer.resource({
    uri,
    name: spec.name,
    description: spec.description,
    mimeType: UiResourceMimeType,
    content: Effect.succeed({
      contents: [
        {
          uri,
          mimeType: UiResourceMimeType,
          text: spec.html,
          _meta: spec.meta ? { ui: spec.meta } : undefined,
        },
      ],
    }),
  });

export const makeUiRenderTool = <
  const Name extends string,
  Parameters extends Schema.Top,
  Success extends Schema.Top,
>(
  resourceUri: string,
  spec: {
    name: Name;
    title: string;
    description: string;
    parameters: Parameters;
    success: Success;
  },
) =>
  Tool.make(spec.name, {
    description: spec.description,
    parameters: spec.parameters,
    success: spec.success,
    failure: Schema.Never,
  })
    .annotate(Tool.Title, spec.title)
    .annotate(Tool.Meta, { ui: { resourceUri } });

export const makeUiAppTool = <
  const Name extends string,
  Parameters extends Schema.Top,
  Success extends Schema.Top,
>(spec: {
  name: Name;
  description: string;
  parameters: Parameters;
  success: Success;
}) =>
  Tool.make(spec.name, {
    description: spec.description,
    parameters: spec.parameters,
    success: spec.success,
    failure: Schema.Never,
  }).annotate(Tool.Meta, { ui: { visibility: ["app"] } });

export class McpAppService extends ServiceMap.Service<McpAppService>()(
  "McpAppService",
  {
    make: Effect.sync(() => ({
      makeResource: makeUiResource,
      makeRenderTool: makeUiRenderTool,
      makeAppTool: makeUiAppTool,
    })),
  },
) {
  Default = Layer.effect(McpAppService, McpAppService.make);
}
