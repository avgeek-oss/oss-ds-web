// @dsCard group="Feedback" height=120
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div
    style={{
      display: "grid",
      gap: 16,
      padding: 16,
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    }}
  >
    {(["shimmer", "pulse", "none"] as const).map((animationType) => (
      <div key={animationType} style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>
          {animationType}
        </span>
        <A.Skeleton
          animationType={animationType}
          style={{ height: 32, width: "100%" }}
        />
        <A.Skeleton
          animationType={animationType}
          style={{ height: 16, width: "66%" }}
        />
      </div>
    ))}
  </div>,
);
