import { type LitElement } from "lit";

declare global {
  // biome-ignore lint/suspicious/noExplicitAny: Lit mixins accept the base constructor arguments.
  export type LitMixin<T = unknown> = new (...args: any[]) => T & LitElement;
}

export declare const TW: <T extends LitMixin>(superClass: T) => T;
