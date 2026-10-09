import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [dts({ entryRoot: "lib" }), tailwindcss()],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, "lib/main.ts"),
      name: "UiLit",
      fileName: "ui-lit",
    },
  },
});
