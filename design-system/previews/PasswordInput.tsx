// @dsCard group="Forms" height=208
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const panel = { background: "var(--surface)", borderRadius: 16, padding: 16 };
mount(
  <div style={{ padding: 16, display: "grid", gap: 16, maxWidth: 448 }}>
    <A.PasswordInput
      aria-label="Password"
      defaultValue="correct horse battery staple"
    />
    <div style={panel}>
      <A.PasswordInput
        aria-label="Current password"
        variant="secondary"
        placeholder="Current password"
      />
    </div>
    <A.PasswordInput
      aria-label="Disabled password"
      disabled
      value="preview-password"
    />
  </div>,
);
