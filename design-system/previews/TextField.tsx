// @dsCard group="Forms" height=224
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ padding: 16, display: "grid", gap: 16, maxWidth: 384 }}>
    <A.TextField
      label="Bluesky handle or server URL"
      description="For example name.bsky.social."
      placeholder="name.bsky.social"
      required
    />
    <A.TextField multiline label="Description" rows={2} />
  </div>,
);
