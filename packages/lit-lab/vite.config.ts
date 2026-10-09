import { resolve } from "node:path";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(({ command, mode }) => ({
  plugins: [viteSingleFile({ useRecommendedBuildConfig: false })],
  resolve:
    command === "serve"
      ? {
          alias: {
            "@repo/ui-lit": resolve(__dirname, "../ui-lit/lib/main.ts"),
          },
        }
      : undefined,
  build: {
    modulePreload: {
      polyfill: false,
    },
    assetsInlineLimit: () => true,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    outDir: "dist",
    emptyOutDir: false,
    assetsDir: "",
    rollupOptions: {
      input: resolve(__dirname, `src/${mode}/index.html`),
      output: {
        codeSplitting: false,
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
}));
