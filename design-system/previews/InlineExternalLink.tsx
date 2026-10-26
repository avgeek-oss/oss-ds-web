// @dsCard group="Navigation" height=64
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <p style={{ padding: 16, margin: 0, fontSize: 14 }}>
    Read the{" "}
    <A.InlineExternalLink
      href="https://github.com/avgeek-oss/oss-design-system"
      tooltip="github.com/avgeek-oss/oss-design-system"
    >
      design system documentation
    </A.InlineExternalLink>{" "}
    before adding a component.
  </p>,
);
