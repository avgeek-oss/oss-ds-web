// @dsCard group="Forms" height=352
import type { ComponentProps } from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const panel = { background: "var(--surface)", borderRadius: 16, padding: 16 };
function Entry({
  label,
  variant,
  ...props
}: ComponentProps<typeof A.DateField> & {
  label?: string;
  variant?: ComponentProps<typeof A.DateField.Group>["variant"];
}) {
  return (
    <A.DateField style={{ width: "100%" }} {...props}>
      <A.Label>{label}</A.Label>
      <A.DateField.Group variant={variant} fullWidth>
        <A.DateField.Input>
          {(segment) => <A.DateField.Segment segment={segment} />}
        </A.DateField.Input>
      </A.DateField.Group>
    </A.DateField>
  );
}
const date = A.parseDate("2026-10-06");
mount(
  <div style={{ padding: 16, display: "grid", gap: 16, maxWidth: 448 }}>
    <Entry label="Start date" defaultValue={date} />
    <div style={panel}>
      <Entry
        label="Renewal date"
        variant="secondary"
        defaultValue={date.add({ months: 1 })}
      />
    </div>
    <Entry label="End date" />
    <Entry label="Archived on" isDisabled defaultValue={date} />
  </div>,
);
