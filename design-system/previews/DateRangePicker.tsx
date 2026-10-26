// @dsCard group="Pickers" height=280
import type { ComponentProps } from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const panel = { background: "var(--surface)", borderRadius: 16, padding: 16 };
function Range({
  label,
  variant,
  ...props
}: ComponentProps<typeof A.DateRangePicker> & {
  label: string;
  variant?: ComponentProps<typeof A.DateField.Group>["variant"];
}) {
  return (
    <A.DateRangePicker style={{ width: "100%" }} {...props}>
      <A.Label>{label}</A.Label>
      <A.DateField.Group variant={variant} fullWidth>
        <A.DateField.InputContainer>
          <A.DateField.Input slot="start" aria-label="Start date">
            {(segment) => <A.DateField.Segment segment={segment} />}
          </A.DateField.Input>
          <A.DateRangePicker.RangeSeparator />
          <A.DateField.Input slot="end" aria-label="End date">
            {(segment) => <A.DateField.Segment segment={segment} />}
          </A.DateField.Input>
        </A.DateField.InputContainer>
        <A.DateField.Suffix>
          <A.DateRangePicker.Trigger aria-label="Choose date range">
            <A.DateRangePicker.TriggerIndicator />
          </A.DateRangePicker.Trigger>
        </A.DateField.Suffix>
      </A.DateField.Group>
      <A.DateRangePicker.Popover>
        <A.RangeCalendar aria-label={`${label} calendar`}>
          <A.RangeCalendar.Header>
            <A.RangeCalendar.NavButton slot="previous" />
            <A.RangeCalendar.Heading />
            <A.RangeCalendar.NavButton slot="next" />
          </A.RangeCalendar.Header>
          <A.RangeCalendar.Grid>
            <A.RangeCalendar.GridHeader>
              {(day) => (
                <A.RangeCalendar.HeaderCell>{day}</A.RangeCalendar.HeaderCell>
              )}
            </A.RangeCalendar.GridHeader>
            <A.RangeCalendar.GridBody>
              {(date) => <A.RangeCalendar.Cell date={date} />}
            </A.RangeCalendar.GridBody>
          </A.RangeCalendar.Grid>
        </A.RangeCalendar>
      </A.DateRangePicker.Popover>
    </A.DateRangePicker>
  );
}
const date = A.parseDate("2026-10-06");
mount(
  <div style={{ padding: 16, display: "grid", gap: 16, maxWidth: 448 }}>
    <Range
      label="Reporting period"
      defaultValue={{ start: date, end: date.add({ days: 6 }) }}
    />
    <div style={panel}>
      <Range
        label="Retention window"
        variant="secondary"
        defaultValue={{ start: date.subtract({ days: 30 }), end: date }}
      />
    </div>
    <Range
      label="Disabled range"
      isDisabled
      defaultValue={{ start: date, end: date.add({ days: 6 }) }}
    />
  </div>,
);
