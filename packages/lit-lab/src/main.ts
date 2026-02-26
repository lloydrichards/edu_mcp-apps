import "@repo/ui-lit";

const mount = () => {
  let appRoot = document.querySelector("#app") as HTMLElement | null;
  if (!appRoot) {
    appRoot = document.createElement("div");
    appRoot.id = "app";
    document.body.append(appRoot);
  }
  appRoot.innerHTML = `
    <div style="padding: 12px;">
      <get-time-card></get-time-card>
    </div>
  `;
};

const normalizeTime = (value: unknown) => {
  if (typeof value !== "string") return "";
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "string" ? parsed : value;
  } catch {
    return value;
  }
};

let nextId = 1;

const sendRequest = (method: string, params: Record<string, unknown>) => {
  const id = nextId++;
  window.parent.postMessage({ jsonrpc: "2.0", id, method, params }, "*");
  return new Promise<unknown>((resolve, reject) => {
    const listener = (event: MessageEvent) => {
      const payload = event.data?.payload ?? event.data;
      if (!payload || payload.id !== id) return;
      window.removeEventListener("message", listener);
      if (payload.result) return resolve(payload.result);
      reject(payload.error || new Error("Request failed"));
    };
    window.addEventListener("message", listener);
  });
};

const sendNotification = (method: string, params: Record<string, unknown>) => {
  window.parent.postMessage({ jsonrpc: "2.0", method, params }, "*");
};

const connectApp = async () => {
  const card = document.querySelector("get-time-card") as
    | (HTMLElement & {
        serverTime?: string;
        status?: string;
        refreshing?: boolean;
      })
    | null;
  if (!card) return;

  try {
    card.status = "Initializing…";
    await sendRequest("ui/initialize", {
      appCapabilities: {},
      appInfo: { name: "get-time", version: "0.1.0" },
      protocolVersion: "2025-06-18",
    });
    sendNotification("ui/notifications/initialized", {});
  } catch {
    card.status = "Connect failed";
    return;
  }

  card.status = "Ready";

  window.addEventListener("message", (event) => {
    const data = event.data?.payload ?? event.data;
    if (!data || !data.method) return;
    if (data.method === "ui/notifications/tool-result") {
      const time = normalizeTime(data.params?.content?.[0]?.text);
      if (time) card.serverTime = time;
      card.status = "Updated";
      card.refreshing = false;
    }
  });

  card.addEventListener("refresh", async () => {
    card.refreshing = true;
    card.status = "Refreshing…";
    try {
      const result = await sendRequest("tools/call", {
        name: "get_time",
        arguments: {},
      });
      const payload = result as { content?: Array<{ text?: string }> } | null;
      const time = normalizeTime(payload?.content?.[0]?.text);
      if (time) card.serverTime = time;
      card.status = "Updated";
    } catch {
      card.status = "Refresh failed";
    } finally {
      card.refreshing = false;
    }
  });
};

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      mount();
      void connectApp();
    },
    { once: true },
  );
} else {
  mount();
  void connectApp();
}
