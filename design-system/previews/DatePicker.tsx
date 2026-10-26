// @dsCard group="Pickers" height=360
import type { ComponentProps } from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const panel = { background: "var(--surface)", borderRadius: 16, padding: 16 };
function Picker({
  label,
  variant,
  ...props
}: ComponentProps<typeof A.DatePicker> & {
  label: string;
  variant?: ComponentProps<typeof A.DateField.Group>["variant"];
}) {
  return (
    <A.DatePicker style={{ width: "100%" }} {...props}>
      <A.Label>{label}</A.Label>
      <A.DateField.Group variant={variant} fullWidth>
        <A.DateField.Input>
          {(segment) => <A.DateField.Segment segment={segment} />}
        </A.DateField.Input>
        <A.DateField.Suffix>
          <A.DatePicker.Trigger>
            <A.DatePicker.TriggerIndicator />
          </A.DatePicker.Trigger>
        </A.DateField.Suffix>
      </A.DateField.Group>
      <A.DatePicker.Popover>
        <A.Calendar aria-label="Choose date">
          <A.Calendar.Header>
            <A.Calendar.NavButton slot="previous" />
            <A.Calendar.Heading />
            <A.Calendar.NavButton slot="next" />
          </A.Calendar.Header>
          <A.Calendar.Grid>
            <A.Calendar.GridHeader>
              {(day) => <A.Calendar.HeaderCell>{day}</A.Calendar.HeaderCell>}
            </A.Calendar.GridHeader>
            <A.Calendar.GridBody>
              {(date) => <A.Calendar.Cell date={date} />}
            </A.Calendar.GridBody>
          </A.Calendar.Grid>
        </A.Calendar>
      </A.DatePicker.Popover>
    </A.DatePicker>
  );
}
const date = A.parseDate("2026-10-06");
mount(
  <div style={{ padding: 16, display: "grid", gap: 16, maxWidth: 448 }}>
    <Picker label="Due date" defaultValue={date} />
    <div style={panel}>
      <Picker
        label="Expires on"
        variant="secondary"
        defaultValue={date.add({ days: 90 })}
      />
    </div>
    <Picker label="Invalid date" isInvalid defaultValue={date} />
    <Picker label="Disabled date" isDisabled defaultValue={date} />
  </div>,
);
