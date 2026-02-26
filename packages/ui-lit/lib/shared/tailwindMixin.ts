import { adoptStyles, type LitElement, unsafeCSS } from "lit";
import tailwindCss from "../styles/tailwind.global.css?inline";

declare global {
  // biome-ignore lint/suspicious/noExplicitAny: mixin typing
  export type LitMixin<T = unknown> = new (...args: any[]) => T & LitElement;
}

export const tailwind = unsafeCSS(tailwindCss);

const tailwindStyleSheet = tailwind.styleSheet;

if (
  tailwindStyleSheet &&
  document?.adoptedStyleSheets &&
  !document.adoptedStyleSheets.some(
    (sheet) =>
      sheet.cssRules[0]?.cssText === tailwindStyleSheet.cssRules[0]?.cssText,
  )
) {
  const propertiesSheet = new CSSStyleSheet();
  let code = tailwind.cssText;
  code = code
    .replaceAll("inherits: false", "inherits: true")
    .substring(code.indexOf("@property"));
  propertiesSheet.replaceSync(code);
  document.adoptedStyleSheets.push(propertiesSheet);
}

export const TW = <T extends LitMixin>(superClass: T): T =>
  class extends superClass {
    override connectedCallback() {
      super.connectedCallback();
      if (this.shadowRoot) adoptStyles(this.shadowRoot, [tailwind]);
    }
  };
