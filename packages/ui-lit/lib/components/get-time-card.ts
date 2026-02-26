import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { TW } from "../shared/tailwindMixin";

const TwLitElement = TW(LitElement);

@customElement("get-time-card")
export class GetTimeCard extends TwLitElement {
  protected override createRenderRoot() {
    return this;
  }

  @property({ type: String }) declare title: string;

  @property({ type: String }) declare serverTime: string;

  @property({ type: String }) declare status: string;

  @property({ type: Boolean }) declare refreshing: boolean;

  @state() private declare clientTime: string;

  @state() private declare clientLive: boolean;

  private clientIntervalId: number | null = null;

  constructor() {
    super();
    this.title = "Get Time";
    this.serverTime = "Waiting for server…";
    this.status = "Ready";
    this.refreshing = false;
    this.clientTime = "--:--:--";
    this.clientLive = true;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.startClientClock();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.clientIntervalId !== null) {
      window.clearInterval(this.clientIntervalId);
      this.clientIntervalId = null;
    }
  }

  private formatClientTime(date: Date) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  private formatServerTime(value: string) {
    if (!value) return "[no time returned]";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return this.formatClientTime(parsed);
  }

  private startClientClock() {
    if (this.clientIntervalId !== null) return;
    const tick = () => {
      this.clientTime = this.formatClientTime(new Date());
    };
    tick();
    this.clientIntervalId = window.setInterval(tick, 1000);
    this.clientLive = true;
  }

  private handleRefresh = async () => {
    this.dispatchEvent(
      new CustomEvent("refresh", { bubbles: true, composed: true }),
    );
  };

  override render() {
    return html`
      <div class="wrap" style="padding: 12px 14px; font-family: var(--sl-font-sans, ui-sans-serif, system-ui); color: var(--ink, #1b1b1b);">
        <div class="header" style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
          <div>
            <h1 style="margin: 0; font-size: 14px; font-weight: 600;">${this.title}</h1>
            <p style="margin: 0; font-size: 12px; color: var(--ink-soft, #5b5b5b);">Client ticks locally. Server refreshes on demand.</p>
          </div>
          <sl-tag size="small" variant=${this.clientLive ? "success" : "neutral"}>
            ${this.clientLive ? "Live" : "Idle"}
          </sl-tag>
        </div>

        <div class="grid" style="margin-top: 10px; display: grid; gap: 8px;">
          <div class="row" style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            <div>
              <small style="display: block; text-transform: uppercase; letter-spacing: 0.16em; font-size: 10px; color: var(--ink-soft, #5b5b5b);">Client</small>
              <div class="time" style="font-size: 16px; font-weight: 600; font-family: var(--sl-font-mono, ui-monospace, SFMono-Regular, monospace);">${this.clientTime}</div>
            </div>
          </div>
          <div class="row" style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            <div>
              <small style="display: block; text-transform: uppercase; letter-spacing: 0.16em; font-size: 10px; color: var(--ink-soft, #5b5b5b);">Server</small>
              <div class="time" style="font-size: 16px; font-weight: 600; font-family: var(--sl-font-mono, ui-monospace, SFMono-Regular, monospace);">${this.formatServerTime(this.serverTime)}</div>
            </div>
            <div class="actions" style="display: flex; align-items: center; gap: 10px;">
              <sl-button
                size="small"
                variant="primary"
                type="button"
                ?disabled=${this.refreshing}
                @click=${this.handleRefresh}
              >
                Refresh
              </sl-button>
            </div>
          </div>
        </div>

        <div class="status" style="margin-top: 6px; font-size: 11px; color: var(--ink-soft, #5b5b5b); min-height: 16px;">${this.status}</div>
      </div>
    `;
  }
}
