// @dsCard group="Feedback" height=72
import type { ComponentProps } from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const circle = (props: ComponentProps<typeof A.ProgressCircle>) => (
  <A.ProgressCircle {...props}>
    <A.ProgressCircle.Track>
      <A.ProgressCircle.TrackCircle />
      <A.ProgressCircle.FillCircle />
    </A.ProgressCircle.Track>
  </A.ProgressCircle>
);
mount(
  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: 16 }}>
    {[0, 35, 70, 100].map((value) => (
      <span key={value}>
        {circle({ value, "aria-label": `Upload ${value} percent` })}
      </span>
    ))}
    {circle({ isIndeterminate: true, "aria-label": "Preparing upload" })}
  </div>,
);
