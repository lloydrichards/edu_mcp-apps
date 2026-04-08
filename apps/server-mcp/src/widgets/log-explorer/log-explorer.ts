import { Effect, Layer, Ref, Schedule, Schema } from "effect";
import { Tool } from "effect/unstable/ai";
import {
  makeUiAppTool,
  makeUiRenderTool,
  makeUiResource,
} from "../../service/McpAppService";
import LogExplorerHtmlSource from "./index.html" with { type: "text" };

const LogExplorerUiResourceUri = "ui://examples/log-explorer";
const MaxLogEntries = 200;
const LogExplorerHtml = LogExplorerHtmlSource as unknown as string;

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

export const LogExplorerResourceLayer = makeUiResource(
  LogExplorerUiResourceUri,
  {
    name: "Log Explorer",
    description: "Live log explorer UI",
    html: LogExplorerHtml,
  },
);

export const LogExplorerTool = makeUiRenderTool(LogExplorerUiResourceUri, {
  name: "render_log_explorer",
  title: "Log Explorer",
  description: "Render the log explorer UI",
  parameters: Tool.EmptyParams,
  success: Schema.String,
});

export const PollLogEntriesTool = makeUiAppTool({
  name: "poll_log_entries",
  description: "Return the latest log entries since the cursor",
  parameters: PollLogEntriesParams,
  success: PollLogEntriesResult,
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
