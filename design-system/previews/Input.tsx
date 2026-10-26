// @dsCard group="Forms" height=296
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const panel = {
  background: "var(--surface)",
  borderRadius: 16,
  padding: 16,
  display: "grid",
  gap: 12,
};
mount(
  <div style={{ padding: 16, display: "grid", gap: 16, maxWidth: 448 }}>
    <div style={{ display: "grid", gap: 12 }}>
      <A.Input aria-label="Email" type="email" placeholder="you@example.com" />
      <A.Input aria-label="Team name" defaultValue="Avgeek Ops" />
      <A.Input
        aria-label="Invalid email"
        aria-invalid
        data-invalid="true"
        defaultValue="avgeek.dev"
      />
      <A.Input aria-label="Disabled" disabled value="ops@avgeek.dev" />
    </div>
    <div style={panel}>
      <A.Input
        aria-label="API key name"
        variant="secondary"
        placeholder="Deploy script"
      />
    </div>
  </div>,
);
