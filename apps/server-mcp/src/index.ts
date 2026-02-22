import { McpSchema, McpServer, Tool, Toolkit } from "@effect/ai";
import { HttpLayerRouter, HttpServer } from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { Config, Effect, Layer, Schema } from "effect";

// Define Resources
const ResourceLayer = Layer.mergeAll(
  McpServer.resource({
    uri: "app://primer",
    name: "Primer Document",
    description: "Documentation for the application",
    content: Effect.succeed(
      "This is a sample primer document to demonstrate MCP server capabilities.",
    ),
  }),
  McpServer.resource({
    uri: "ui://hello/view.html",
    name: "Hello World Button",
    description: "Hello world button MCP App view",
    mimeType: "text/html;profile=mcp-app",
    content: Effect.succeed({
      contents: [
        {
          uri: "ui://hello/view.html",
          mimeType: "text/html;profile=mcp-app",
          _meta: {
            ui: {
              csp: "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'",
            },
          },
          text: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hello World Button</title>
  </head>
  <body>
    <div class="card">
      <p>Click the button to say hello.</p>
      <button id="ping">Say hello</button>
      <div id="status">Waiting for your click.</div>
    </div>
    <script>
      const statusEl = document.getElementById("status");
      const button = document.getElementById("ping");

      button.addEventListener("click", () => {
        statusEl.textContent = "Hello world!";
      });

      parent.postMessage(
        {
          jsonrpc: "2.0",
          id: 1,
          method: "ui/initialize",
          params: {
            appCapabilities: {
              availableDisplayModes: ["inline", "pip", "fullscreen"],
            },
          },
        },
        "*",
      );
    </script>
  </body>
</html>`,
        },
      ],
    }),
  }),
  // You can add more resources here
);

// Define Prompts
const PromptLayer = Layer.mergeAll(
  McpServer.prompt({
    name: "Hello Prompt",
    description: "A simple greeting prompt",
    parameters: Schema.Struct({
      name: Schema.String,
    }),
    content: ({ name }) =>
      Effect.succeed(
        `Hello, ${name}! Welcome to the MCP server demonstration.`,
      ),
  }),
  // You can add more prompts here
);

// Define Toolkit
class AiTools extends Toolkit.make(
  Tool.make("GetDadJoke", {
    description: "Get a hilarious dad joke from the ICanHazDadJoke API",
    success: Schema.String,
    failure: Schema.Never,
    parameters: {
      searchTerm: Schema.String.annotations({
        description: "The search term to use to find dad jokes",
      }),
    },
  }),
  // You can add more tools here
) {}

const ToolLayer = McpServer.toolkit(AiTools).pipe(
  Layer.provide(
    AiTools.toLayer(
      Effect.succeed({
        GetDadJoke: ({ searchTerm }) =>
          Effect.succeed(
            `Here's a dad joke about ${searchTerm}: Why don't ${searchTerm}s ever get lost? Because they always follow the map!`,
          ),
        // add implementation for more tools here
      }),
    ),
  ),
);

const UiToolLayer = Layer.effectDiscard(
  Effect.gen(function* () {
    const server = yield* McpServer.McpServer;
    yield* server.addTool({
      tool: new McpSchema.Tool({
        name: "HelloUi",
        description: "Hello MCP App UI tool",
        inputSchema: {
          type: "object",
          properties: { name: { type: "string" } },
          required: ["name"],
          additionalProperties: false,
        },
        _meta: { ui: { resourceUri: "ui://hello/view.html" } },
      } as any),
      handle: ({ name }: { name: string }) =>
        Effect.succeed(
          new McpSchema.CallToolResult({
            content: [{ type: "text", text: `Hello ${name}!` }],
            structuredContent: {
              message: `Hello ${name}!`,
              timestamp: new Date().toISOString(),
            },
          } as any),
        ),
    });
  }),
).pipe(Layer.provide(McpServer.McpServer.layer));

// Define Live API
const McpLive = Layer.mergeAll(
  ResourceLayer,
  PromptLayer,
  ToolLayer,
  UiToolLayer,
);

const ServerConfig = Config.all({
  port: Config.number("MCP_PORT").pipe(Config.withDefault(9009)),
});

const McpRouter = McpServer.layerHttpRouter({
  name: "BEVR MCP Server",
  version: "0.1.0",
  path: "/mcp",
}).pipe(
  Layer.provideMerge(McpLive),
  Layer.provide(
    HttpLayerRouter.cors({
      allowedOrigins: ["*"],
      allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "mcp-protocol-version"],
      credentials: false,
    }),
  ),
);

const HttpLive = HttpLayerRouter.serve(McpRouter).pipe(
  HttpServer.withLogAddress,
  Layer.provideMerge(BunHttpServer.layerConfig(ServerConfig)),
);

BunRuntime.runMain(Layer.launch(HttpLive));
