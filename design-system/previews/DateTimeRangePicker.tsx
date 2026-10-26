// @dsCard group="Pickers" height=360
import * as React from "react";
import type { ComponentProps } from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
function Controlled({
  initial,
  ...props
}: Omit<ComponentProps<typeof A.DateTimeRangePicker>, "value" | "onChange"> & {
  initial: ComponentProps<typeof A.DateTimeRangePicker>["value"];
}) {
  const [value, setValue] = React.useState(initial);
  return (
    <A.DateTimeRangePicker
      locale="en-GB"
      hourCycle={24}
      {...props}
      value={value}
      onChange={(next) => next && setValue(next)}
    />
  );
}
const panel = {
  background: "var(--surface)",
  borderRadius: 16,
  padding: 16,
  display: "grid",
};
const seed = A.parseDateTime("2026-10-06T00:00");
const range = {
  start: seed.set({ year: 2026, month: 10, day: 10, hour: 8, minute: 45 }),
  end: seed.set({ year: 2026, month: 10, day: 14, hour: 18, minute: 45 }),
};
mount(
  <div style={{ padding: 16, display: "grid", gap: 16, maxWidth: 672 }}>
    <Controlled label="Date and time range" initial={range} />
    <div style={panel}>
      <Controlled
        label="Maintenance window"
        variant="secondary"
        initial={range}
      />
    </div>
    <A.DateTimeRangePicker label="Empty range" locale="en-GB" />
    <Controlled label="Disabled range" isDisabled initial={range} />
  </div>,
);
