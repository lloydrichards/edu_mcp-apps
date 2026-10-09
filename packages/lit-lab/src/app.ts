import {
  App,
  applyDocumentTheme,
  applyHostFonts,
  applyHostStyleVariables,
} from "@modelcontextprotocol/ext-apps";

const applyContext = (
  context: NonNullable<ReturnType<App["getHostContext"]>>,
) => {
  if (context.theme) applyDocumentTheme(context.theme);
  if (context.styles?.variables)
    applyHostStyleVariables(context.styles.variables);
  if (context.styles?.css?.fonts) applyHostFonts(context.styles.css.fonts);
  if (context.safeAreaInsets) {
    const { top, right, bottom, left } = context.safeAreaInsets;
    document.body.style.padding = `${top}px ${right}px ${bottom}px ${left}px`;
  }
};

export const createApp = (name: string) => {
  const app = new App({ name, version: "0.2.0" }, {});
  app.onhostcontextchanged = applyContext;
  return app;
};

export const connectApp = async (app: App) => {
  await app.connect();
  const context = app.getHostContext();
  if (context) applyContext(context);
};
