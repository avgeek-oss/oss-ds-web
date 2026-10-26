// @dsCard group="Feedback" height=64
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const row = { display: "flex", alignItems: "center", gap: 16 } as const;
mount(
  <div style={{ display: "grid", gap: 16, padding: 16 }}>
    <div style={row}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <A.Spinner key={size} size={size} aria-label="Loading" />
      ))}
      <span style={{ width: 16 }} />
      {(["accent", "success", "warning", "danger", "current"] as const).map(
        (color) => (
          <A.Spinner key={color} color={color} aria-label="Loading" />
        ),
      )}
    </div>
  </div>,
);
