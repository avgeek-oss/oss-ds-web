// @dsCard group="Account settings" height=320
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ padding: 16, maxWidth: 512 }}>
    <A.ProfileSettings
      name="Alex Rivera"
      email="alex@avgeek.dev"
      role="member"
      providerName="authentik"
    />
  </div>,
);
