import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { Config, Effect, Layer, Schema } from "effect";
import { McpServer, Tool, Toolkit } from "effect/unstable/ai";
import { HttpRouter, HttpServer } from "effect/unstable/http";

const UiResourceUri = "ui://example/hello-app";
const UiResourceMimeType = "text/html;profile=mcp-app";

const UiHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hello MCP App</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #f8f4ef;
        --card: #fff9f1;
        --ink: #1b1b1b;
        --muted: #5f5b55;
        --accent: #c4562f;
        --shadow: rgba(30, 20, 10, 0.12);
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #171412;
          --card: #221b17;
          --ink: #f3eee7;
          --muted: #b9b0a6;
          --accent: #ff8a52;
          --shadow: rgba(0, 0, 0, 0.35);
        }
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", serif;
        background: radial-gradient(120% 120% at 0% 0%, rgba(255, 200, 160, 0.18), transparent 55%),
          radial-gradient(120% 120% at 100% 0%, rgba(255, 170, 120, 0.12), transparent 50%),
          var(--bg);
        color: var(--ink);
      }
      .frame {
        padding: 24px 22px 28px;
      }
      .card {
        background: var(--card);
        border-radius: 18px;
        padding: 20px 18px 18px;
        box-shadow: 0 18px 40px var(--shadow);
        border: 1px solid rgba(120, 90, 60, 0.12);
      }
      h1 {
        font-size: 20px;
        margin: 0 0 6px;
        letter-spacing: 0.2px;
      }
      p {
        margin: 0;
        color: var(--muted);
        font-size: 14px;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 16px;
      }
      .pill {
        font-size: 12px;
        padding: 6px 10px;
        border-radius: 999px;
        background: rgba(196, 86, 47, 0.12);
        color: var(--accent);
        font-weight: 600;
        letter-spacing: 0.3px;
        text-transform: uppercase;
      }
      .value {
        font-size: 18px;
        font-weight: 600;
      }
      button {
        border: none;
        cursor: pointer;
        padding: 10px 14px;
        border-radius: 12px;
        background: var(--accent);
        color: #fff;
        font-weight: 600;
        font-size: 13px;
        box-shadow: 0 10px 18px rgba(196, 86, 47, 0.25);
      }
      button:disabled {
        opacity: 0.6;
        cursor: default;
        box-shadow: none;
      }
      .log {
        margin-top: 10px;
        font-size: 12px;
        color: var(--muted);
        min-height: 16px;
      }
    </style>
  </head>
  <body>
    <div class="frame">
      <div class="card">
        <h1>Hello from MCP Apps</h1>
        <p>Simple UI resource rendered via ui:// and _meta.ui.resourceUri.</p>
        <div class="row">
          <span class="pill">Message</span>
          <span class="value" id="message">Waiting for tool input...</span>
        </div>
        <div class="row">
          <button id="send">Send to chat</button>
          <span class="pill" id="status">idle</span>
        </div>
        <div class="log" id="log"></div>
      </div>
    </div>
    <script>
      let nextId = 1;
      const messageEl = document.getElementById("message");
      const statusEl = document.getElementById("status");
      const logEl = document.getElementById("log");
      const sendBtn = document.getElementById("send");
      const state = { message: "Hello from the UI" };

      function sendRequest(method, params) {
        const id = nextId++;
        window.parent.postMessage({ jsonrpc: "2.0", id, method, params }, "*");
        return new Promise((resolve, reject) => {
          function listener(event) {
            if (!event.data || event.data.id !== id) return;
            window.removeEventListener("message", listener);
            if (event.data.result) return resolve(event.data.result);
            reject(event.data.error || new Error("Request failed"));
          }
          window.addEventListener("message", listener);
        });
      }

      function sendNotification(method, params) {
        window.parent.postMessage({ jsonrpc: "2.0", method, params }, "*");
      }

      function setStatus(text) {
        statusEl.textContent = text;
      }

      function setLog(text) {
        logEl.textContent = text;
      }

      window.addEventListener("message", (event) => {
        const data = event.data;
        if (!data || !data.method) return;
        if (data.method === "ui/notifications/tool-input") {
          const next = data.params?.arguments?.message;
          if (typeof next === "string") {
            state.message = next;
            messageEl.textContent = next;
          }
        }
        if (data.method === "ui/notifications/tool-result") {
          setStatus(data.params?.isError ? "error" : "done");
          setLog(data.params?.content?.[0]?.text ?? "");
        }
      });

      sendBtn.addEventListener("click", async () => {
        sendBtn.disabled = true;
        setStatus("sending");
        try {
          await sendRequest("ui/message", {
            role: "user",
            content: [{ type: "text", text: state.message }],
          });
          setStatus("sent");
          setLog("Message sent to host.");
        } catch (err) {
          setStatus("error");
          setLog("Message failed.");
        } finally {
          sendBtn.disabled = false;
        }
      });

      sendRequest("ui/initialize", {
        appCapabilities: {},
        appInfo: { name: "hello-ui", version: "0.1.0" },
        protocolVersion: "2025-06-18",
      }).then(() => {
        sendNotification("ui/notifications/initialized", {});
        setStatus("ready");
      });
    </script>
  </body>
</html>`;

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
    uri: UiResourceUri,
    name: "Hello MCP App",
    description: "UI resource for the hello MCP App",
    mimeType: UiResourceMimeType,
    content: Effect.succeed({
      contents: [
        {
          uri: UiResourceUri,
          mimeType: UiResourceMimeType,
          text: UiHtml,
          _meta: {
            ui: {
              prefersBorder: true,
            },
          },
        },
      ],
    }),
  }),
);

// Define Prompts
const PromptLayer = Layer.mergeAll(
  McpServer.prompt({
    name: "Hello Prompt",
    description: "A simple greeting prompt",
    parameters: {
      name: Schema.String,
    },
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
    parameters: Schema.Struct({
      searchTerm: Schema.String.annotate({
        description: "The search term to use to find dad jokes",
      }),
    }),
  }),
) {}

const ToolLayer = McpServer.toolkit(AiTools).pipe(
  Layer.provide(
    AiTools.toLayer({
      GetDadJoke: ({ searchTerm }, _context) =>
        Effect.succeed(
          `Here's a dad joke about ${searchTerm}: Why don't ${searchTerm}s ever get lost? Because they always follow the map!`,
        ),
    }),
  ),
);

class UiTools extends Toolkit.make(Tool.make("HelloUi", {
    description: "Render the Hello MCP App UI",
    parameters: Schema.Struct({
      message: Schema.String,
    }),
    success: Schema.String,
    failure: Schema.Never,
  })
    .annotate(Tool.Title, "Hello MCP App")
    .annotate(Tool.Meta, {
      ui: {
        resourceUri: UiResourceUri,
        visibility: ["app"],
      },
    })) {}

const UiToolLayer = McpServer.toolkit(UiTools).pipe(
  Layer.provide(
    UiTools.toLayer({
      HelloUi: ({ message }) => Effect.succeed(message),
    }),
  ),
);

// Define Live API
const McpLive = Layer.mergeAll(
  ResourceLayer,
  PromptLayer,
  ToolLayer,
  UiToolLayer,
);

const ServerConfig = Config.all({
  port: Config.number("MCP_PORT").pipe(Config.withDefault(() => 9009)),
});

const McpRouter = McpServer.layerHttp({
  name: "BEVR MCP Server",
  version: "0.1.0",
  path: "/mcp",
}).pipe(
  Layer.provideMerge(McpLive),
  Layer.provide(
    HttpRouter.cors({
      allowedOrigins: ["*"],
      allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "mcp-protocol-version"],
      credentials: false,
    }),
  ),
);

const HttpLive = HttpRouter.serve(McpRouter).pipe(
  HttpServer.withLogAddress,
  Layer.provideMerge(BunHttpServer.layerConfig(ServerConfig)),
);

BunRuntime.runMain(Layer.launch(HttpLive).pipe(Effect.scoped));
