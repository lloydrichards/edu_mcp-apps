import { Effect, Layer, Ref, Schedule, Schema } from "effect";
import { McpServer, Tool } from "effect/unstable/ai";
import { UiResourceMimeType, uiContent } from "../shared";

const LogExplorerUiResourceUri = "ui://examples/log-explorer";
const MaxLogEntries = 200;

const LogLevel = Schema.Literals(["debug", "info", "warn", "error"]);

const LogEntry = Schema.Struct({
  id: Schema.Number,
  timestamp: Schema.String,
  level: LogLevel,
  message: Schema.String,
});

const PollLogEntriesParams = Schema.Struct({
  cursor: Schema.optional(Schema.Number),
});

const PollLogEntriesResult = Schema.Struct({
  cursor: Schema.Number,
  entries: Schema.Array(LogEntry),
});

type LogState = {
  nextId: number;
  entries: ReadonlyArray<typeof LogEntry.Type>;
};

const logStateRef = Ref.makeUnsafe<LogState>({ nextId: 1, entries: [] });

const logMessages = [
  "Refreshing cache segment",
  "Sync completed with upstream",
  "Retrying request after timeout",
  "Session token rotated",
  "Background job started",
  "Shard rebalanced",
  "Parsed 128 events",
  "Persisted 12 records",
  "Queue depth normalized",
  "Connection pool warmed",
  "Webhook delivery confirmed",
  "Disk usage check passed",
];

const pickMessage = () =>
  logMessages[Math.floor(Math.random() * logMessages.length)] ?? "";

const pickLevel = (): typeof LogLevel.Type => {
  const roll = Math.random();
  if (roll < 0.08) return "error";
  if (roll < 0.22) return "warn";
  if (roll < 0.7) return "info";
  return "debug";
};

const appendEntry = (state: LogState) => {
  const entry: typeof LogEntry.Type = {
    id: state.nextId,
    timestamp: new Date().toISOString(),
    level: pickLevel(),
    message: pickMessage(),
  };
  const entries = [...state.entries, entry];
  const trimmed =
    entries.length > MaxLogEntries
      ? entries.slice(entries.length - MaxLogEntries)
      : entries;
  return [entry, { nextId: state.nextId + 1, entries: trimmed }] as const;
};

export const LogExplorerStateLayer = Layer.effectDiscard(
  Effect.gen(function* () {
    const run = Effect.repeat(
      Ref.modify(logStateRef, appendEntry),
      Schedule.spaced("450 millis"),
    ).pipe(Effect.asVoid);
    yield* Effect.forkScoped(run);
  }),
);

export const LogExplorerResourceLayer = McpServer.resource({
  uri: LogExplorerUiResourceUri,
  name: "Log Explorer",
  description: "Live log explorer UI",
  mimeType: UiResourceMimeType,
  content: uiContent(LogExplorerUiResourceUri, "log-explorer/index.html"),
});

export const LogExplorerTool = Tool.make("render_log_explorer", {
  description: "Render the log explorer UI",
  parameters: Schema.Struct({}),
  success: Schema.String,
  failure: Schema.Never,
})
  .annotate(Tool.Title, "Log Explorer")
  .annotate(Tool.Meta, {
    ui: {
      resourceUri: LogExplorerUiResourceUri,
    },
  });

export const PollLogEntriesTool = Tool.make("poll_log_entries", {
  description: "Return the latest log entries since the cursor",
  parameters: PollLogEntriesParams,
  success: PollLogEntriesResult,
  failure: Schema.Never,
}).annotate(Tool.Meta, {
  ui: {
    visibility: ["app"],
  },
});

export const renderLogExplorerHandler = () =>
  Effect.succeed("Log explorer ready. Streaming logs...");

export const pollLogEntriesHandler = (
  params: typeof PollLogEntriesParams.Type,
) =>
  Effect.gen(function* () {
    const cursor = params.cursor ?? 0;
    const state = yield* Ref.get(logStateRef);
    const latestCursor = Math.max(state.nextId - 1, 0);
    const entries = state.entries.filter((entry) => entry.id > cursor);
    return { cursor: latestCursor, entries };
  });
