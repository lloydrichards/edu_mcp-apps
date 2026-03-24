import { Effect, FileSystem, Path, Schema } from "effect";

const UiResourceMimeType = "text/html;profile=mcp-app";
const UiBaseUrl = new URL("./", import.meta.url);

type UiMeta = {
  prefersBorder?: boolean;
  csp?: {
    resourceDomains?: string[];
    connectDomains?: string[];
    frameDomains?: string[];
    baseUriDomains?: string[];
  };
};

type UiContentSource = string | URL;

const resolveUiPath = (fileName: UiContentSource) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const pathService = yield* Path.Path;
    const url =
      typeof fileName === "string" ? new URL(fileName, UiBaseUrl) : fileName;
    const path = yield* pathService.fromFileUrl(url);
    const exists = yield* fs.exists(path);
    if (!exists) {
      throw new Error(`No UI resource found for ${url}`);
    }
    return path;
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
