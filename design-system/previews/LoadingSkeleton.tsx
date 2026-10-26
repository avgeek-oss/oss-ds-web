// @dsCard group="Feedback" height=280
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ padding: 16 }}>
    <A.LoadingSkeleton aria-label="Loading account settings">
      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        }}
      >
        <A.SkeletonCard style={{ height: 112 }} />
        <A.SkeletonCard style={{ height: 112 }} />
      </div>
      <A.SkeletonCard style={{ height: 120 }} />
    </A.LoadingSkeleton>
  </div>,
);
