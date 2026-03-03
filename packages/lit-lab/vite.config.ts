import { resolve } from "node:path";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(({ command }) => ({
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
    emptyOutDir: true,
    assetsDir: "",
    rollupOptions: {
      input: {
        get_time: resolve(__dirname, "src/get_time/index.html"),
        counter: resolve(__dirname, "src/counter/index.html"),
      },
      output: {
        inlineDynamicImports: false,
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
}));
