// @dsCard group="Forms" height=280
import type { ComponentProps } from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const panel = { background: "var(--surface)", borderRadius: 16, padding: 16 };
function Entry({
  label,
  variant,
  ...props
}: ComponentProps<typeof A.TimeField> & {
  label?: string;
  variant?: ComponentProps<typeof A.DateField.Group>["variant"];
}) {
  return (
    <A.TimeField style={{ width: "100%" }} {...props}>
      <A.Label>{label}</A.Label>
      <A.TimeField.Group variant={variant} fullWidth>
        <A.TimeField.Input>
          {(segment) => <A.TimeField.Segment segment={segment} />}
        </A.TimeField.Input>
      </A.TimeField.Group>
    </A.TimeField>
  );
}
const time = A.parseTime("00:00");
mount(
  <div style={{ padding: 16, display: "grid", gap: 16, maxWidth: 448 }}>
    <Entry
      label="Quiet hours start"
      hourCycle={24}
      defaultValue={time.set({ hour: 22, minute: 0 })}
    />
    <div style={panel}>
      <Entry
        label="Start time"
        variant="secondary"
        hourCycle={12}
        defaultValue={time.set({ hour: 8, minute: 45 })}
      />
    </div>
    <Entry
      label="End time"
      isDisabled
      hourCycle={24}
      defaultValue={time.set({ hour: 18, minute: 45 })}
    />
  </div>,
);
