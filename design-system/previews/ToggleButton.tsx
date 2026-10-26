// @dsCard group="Actions" height=128
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ padding: 16, display: "grid", gap: 16 }}>
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 12,
      }}
    >
      <A.ToggleButton>Compare</A.ToggleButton>
      <A.ToggleButton defaultSelected>Compare</A.ToggleButton>
      <A.ToggleButton variant="ghost">Show failed only</A.ToggleButton>
      <A.ToggleButton size="sm">Small</A.ToggleButton>
      <A.ToggleButton isDisabled>Disabled</A.ToggleButton>
    </div>
    <A.ToggleButtonGroup
      selectionMode="single"
      defaultSelectedKeys={["day"]}
      aria-label="Range"
    >
      <A.ToggleButton id="day">Day</A.ToggleButton>
      <A.ToggleButton id="week">Week</A.ToggleButton>
      <A.ToggleButton id="month">Month</A.ToggleButton>
    </A.ToggleButtonGroup>
  </div>,
);
