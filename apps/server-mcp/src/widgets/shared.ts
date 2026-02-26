import { Effect } from "effect";

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

const uiContent = (
  uri: string,
  fileName: string,
  uiMeta: UiMeta = { prefersBorder: true },
) =>
  Effect.gen(function* () {
    const html = yield* Effect.tryPromise({
      try: () => Bun.file(new URL(fileName, UiBaseUrl)).text(),
      catch: (error) =>
        new Error(`Failed to load UI resource ${fileName}: ${String(error)}`),
    });
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
