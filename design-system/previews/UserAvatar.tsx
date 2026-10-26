// @dsCard group="Data display" height=80
import * as A from "../namespace.js";
import { mount } from "./mount.js";
// src="" keeps the preview offline; in an app UserAvatar looks up Gravatar from the email.
mount(
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16 }}>
    <A.UserAvatar
      email="amelia.earhart@avgeek.dev"
      name="Amelia Earhart"
      src=""
    />
    <A.UserAvatar email="ops-bot@avgeek.dev" src="" />
    <A.UserAvatar
      email="bessie.coleman@avgeek.dev"
      name="Bessie Coleman"
      size="lg"
      src=""
    />
  </div>,
);
