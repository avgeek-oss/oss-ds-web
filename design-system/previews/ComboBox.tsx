// @dsCard group="Pickers" height=200
import type { ComponentProps } from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const zones = [
  "UTC",
  "Europe/London",
  "America/New_York",
  "Asia/Kolkata",
  "Australia/Sydney",
];
const panel = { background: "var(--surface)", borderRadius: 16, padding: 16 };
function Zone(props: ComponentProps<typeof A.ComboBox>) {
  return (
    <A.ComboBox {...props}>
      <A.Label>Time zone</A.Label>
      <A.ComboBox.InputGroup>
        <A.Input placeholder="Select or search" />
        <A.ComboBox.Trigger aria-label="Show options" />
      </A.ComboBox.InputGroup>
      <A.ComboBox.Popover>
        <A.ListBox>
          {zones.map((zone) => (
            <A.ListBox.Item id={zone} key={zone} textValue={zone}>
              {zone}
              <A.ListBox.ItemIndicator />
            </A.ListBox.Item>
          ))}
        </A.ListBox>
      </A.ComboBox.Popover>
    </A.ComboBox>
  );
}
mount(
  <div style={{ padding: 16, display: "grid", gap: 16, maxWidth: 448 }}>
    <Zone defaultSelectedKey="Europe/London" />
    <div style={panel}>
      <Zone variant="secondary" />
    </div>
  </div>,
);
