// @dsCard group="Layouts" height=72
import * as A from "../namespace.js";
import { mount } from "./mount.js";
// Keep the frame's theme: Providers reads the mode from the root element first.
document.documentElement.dataset.themeMode =
  document.documentElement.dataset.theme || "light";
mount(
  <A.Providers>
    <div style={{ padding: 16 }}>
      <A.ThemeSwitcher />
    </div>
  </A.Providers>,
);
