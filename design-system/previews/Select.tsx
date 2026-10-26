// @dsCard group="Forms" height=280
import type { ComponentProps } from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const panel = { background: "var(--surface)", borderRadius: 16, padding: 16 };
function Expiry(props: ComponentProps<typeof A.Select>) {
  return (
    <A.Select defaultSelectedKey="90" {...props}>
      <A.Label>Expires after</A.Label>
      <A.Select.Trigger>
        <A.Select.Value />
        <A.Select.Indicator />
      </A.Select.Trigger>
      <A.Select.Popover>
        <A.ListBox>
          {A.apiKeyExpiryOptions.map((option) => (
            <A.ListBox.Item
              key={option.id}
              id={option.id}
              textValue={option.label}
            >
              {option.label}
              <A.ListBox.ItemIndicator />
            </A.ListBox.Item>
          ))}
        </A.ListBox>
      </A.Select.Popover>
    </A.Select>
  );
}
mount(
  <div style={{ padding: 16, display: "grid", gap: 16, maxWidth: 448 }}>
    <Expiry />
    <div style={panel}>
      <Expiry variant="secondary" defaultSelectedKey="never" />
    </div>
    <Expiry isDisabled />
  </div>,
);
