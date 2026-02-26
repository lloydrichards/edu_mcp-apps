import { resolve } from "node:path";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(({ command }) => ({
  plugins: [viteSingleFile()],
  resolve: {
    alias:
      command === "serve"
        ? {
            "@repo/ui-lit": resolve(__dirname, "../ui-lit/lib/main.ts"),
          }
        : {},
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "get_timer.html"),
    },
  },
}));
