// @dsCard group="Layouts" height=112
import * as A from "../namespace.js";
import { mount } from "./mount.js";
// Stand-in for the app logo: a 32px accent tile with the 8px radius.
const mark = (
  <span
    style={{
      display: "block",
      width: 32,
      height: 32,
      borderRadius: 8,
      background: "var(--accent)",
    }}
  />
);
mount(
  <div style={{ display: "grid", gap: 16, padding: 16 }}>
    <A.BrandLockup logo={mark}>Avgeek</A.BrandLockup>
    <A.BrandLockup logo={mark} style={{ maxWidth: 192 }}>
      A longer application name
    </A.BrandLockup>
  </div>,
);
