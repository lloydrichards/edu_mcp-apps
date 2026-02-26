import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths({ ignoreConfigErrors: true }),
    dts({ rollupTypes: true }),
    tailwindcss(),
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, "lib/main.ts"),
      name: "UiLit",
      fileName: "ui-lit",
    },
  },
});
