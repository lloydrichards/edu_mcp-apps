import { build } from "vite";

const watch = process.argv.includes("--watch");
for (const mode of [
  "get_time",
  "counter",
  "bar-chart",
  "line-chart",
  "log-explorer",
  "polling-dashboard",
  "pomodoro-timer",
]) {
  await build({ mode, build: { watch: watch ? {} : null } });
}
