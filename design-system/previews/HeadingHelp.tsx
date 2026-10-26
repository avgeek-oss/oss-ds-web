// @dsCard group="Overlays" height=64
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ padding: 16, display: "flex", gap: 32 }}>
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      API keys
      <A.HeadingHelp
        title="API keys"
        help={{
          description: "Keys let scripts and apps call the API as you.",
          href: "https://github.com/avgeek-oss/oss-design-system",
        }}
      />
    </span>
  </div>,
);
