// @dsCard group="Data display" height=232
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ padding: 16, maxWidth: 420 }}>
    <A.ScrollShadow
      aria-label="Flight log"
      tabIndex={0}
      style={{ height: 200 }}
    >
      <div style={{ display: "grid", gap: 12 }}>
        {Array.from({ length: 16 }, (_, i) => (
          <p key={i} style={{ margin: 0, fontSize: 14 }}>
            Leg {i + 1} · KSFO → KLAX · 1h {10 + i}m
          </p>
        ))}
      </div>
    </A.ScrollShadow>
  </div>,
);
