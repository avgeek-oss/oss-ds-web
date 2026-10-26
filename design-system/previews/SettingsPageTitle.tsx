// @dsCard group="Layouts" height=120
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ display: "grid", gap: 12, padding: 16 }}>
    <h1
      style={{ margin: 0, fontSize: 18, lineHeight: "28px", fontWeight: 500 }}
    >
      <A.SettingsPageTitle section="passkeys" />
    </h1>
    <h1
      style={{ margin: 0, fontSize: 18, lineHeight: "28px", fontWeight: 500 }}
    >
      <A.SettingsPageTitle section="api-keys" />
    </h1>
  </div>,
);
