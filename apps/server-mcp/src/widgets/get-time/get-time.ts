import { Effect, Schema } from "effect";
import { Tool } from "effect/unstable/ai";
import { EmptyParams } from "../shared";

export const GetTimeTool = Tool.make("get_time", {
  description: "Returns the current server time",
  parameters: EmptyParams,
  success: Schema.String,
  failure: Schema.Never,
}).annotate(Tool.Title, "Get Time");

export const getTimeHandler = () => Effect.sync(() => new Date().toISOString());
