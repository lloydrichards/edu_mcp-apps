import { Effect, FileSystem, Path, Schema } from "effect";

const UiResourceMimeType = "text/html;profile=mcp-app";
const UiBaseUrl = new URL("./", import.meta.url);

export const EmptyParams = Schema.Record(Schema.String, Schema.Never);

type UiMeta = {
  prefersBorder?: boolean;
  csp?: {
    resourceDomains?: string[];
    connectDomains?: string[];
    frameDomains?: string[];
    baseUriDomains?: string[];
  };
};

type UiContentSource = string | URL | Array<string | URL>;

const resolveUiPath = (fileName: UiContentSource) =>
  Effect.gen(function* () {
    const candidates = Array.isArray(fileName) ? fileName : [fileName];
    const fs = yield* FileSystem.FileSystem;
    const pathService = yield* Path.Path;
    let lastError: unknown = null;
    for (const candidate of candidates) {
      const url =
        typeof candidate === "string"
          ? new URL(candidate, UiBaseUrl)
          : candidate;
      try {
        const path = yield* pathService.fromFileUrl(url);
        if (yield* fs.exists(path)) {
          return path;
        }
      } catch (error) {
        lastError = error;
      }
    }
    const lastCandidate = candidates[candidates.length - 1];
    const lastUrl =
      typeof lastCandidate === "string"
        ? new URL(lastCandidate, UiBaseUrl)
        : lastCandidate;
    const message = lastError ? `: ${String(lastError)}` : "";
    throw new Error(`No UI resource found for ${lastUrl}${message}`);
  });

const uiContent = (
  uri: string,
  fileName: UiContentSource,
  uiMeta: UiMeta = { prefersBorder: true },
) =>
  Effect.gen(function* () {
    const resolvedPath = yield* resolveUiPath(fileName).pipe(
      Effect.mapError(
        (error) =>
          new Error(
            `Failed to resolve UI resource ${fileName}: ${String(error)}`,
          ),
      ),
    );
    const fs = yield* FileSystem.FileSystem;
    const html = yield* fs
      .readFileString(resolvedPath)
      .pipe(
        Effect.mapError(
          (error) =>
            new Error(
              `Failed to load UI resource ${fileName}: ${String(error)}`,
            ),
        ),
      );
    return {
      contents: [
        {
          uri,
          mimeType: UiResourceMimeType,
          text: html,
          _meta: {
            ui: {
              ...uiMeta,
            },
          },
        },
      ],
    };
  });

export { UiResourceMimeType, uiContent };
