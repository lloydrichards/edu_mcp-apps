import { GetTimeCard } from "@repo/ui-lit";
import { connectApp, createApp } from "../app";

const root = document.querySelector("#app");
if (!root) throw new Error("Get time mount missing");
const card = new GetTimeCard();
root.append(card);
const app = createApp("get-time");

const refresh = async () => {
  card.refreshing = true;
  card.status = "Refreshing...";
  try {
    const result = await app.callServerTool({
      name: "get_time",
      arguments: {},
    });
    const text = result.content.find((item) => item.type === "text")?.text;
    if (result.isError || !text) throw new Error("No server time returned");
    const time = text.startsWith('"') ? JSON.parse(text) : text;
    if (typeof time !== "string")
      throw new Error("Invalid server time returned");
    card.serverTime = time;
    card.status = "Updated";
  } catch {
    card.status = "Refresh failed";
  } finally {
    card.refreshing = false;
  }
};

card.addEventListener("refresh", () => {
  void refresh();
});
app.ontoolresult = () => {
  void refresh();
};
card.status = "Initializing...";
void connectApp(app)
  .then(() => {
    card.status = "Ready";
  })
  .catch(() => {
    card.status = "Connect failed";
  });
