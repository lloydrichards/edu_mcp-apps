import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { TW } from "../shared/tailwindMixin";

const TwLitElement = TW(LitElement);

@customElement("demo-card")
export class DemoCard extends TwLitElement {
  @property() override title = "MCP Widget";

  override render() {
    return html`
      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-900">${this.title}</h2>
        <p class="mt-2 text-sm text-slate-600">Lit + Tailwind inside MCP Apps.</p>
      </div>
    `;
  }
}
