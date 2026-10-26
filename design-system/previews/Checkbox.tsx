// @dsCard group="Forms" height=168
import type { ComponentProps } from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
function Box({
  label,
  ...props
}: ComponentProps<typeof A.Checkbox> & { label: string }) {
  return (
    <A.Checkbox {...props}>
      <A.Checkbox.Content>
        <A.Checkbox.Control>
          <A.Checkbox.Indicator />
        </A.Checkbox.Control>
        <A.Label>{label}</A.Label>
      </A.Checkbox.Content>
    </A.Checkbox>
  );
}
mount(
  <div style={{ padding: 16, display: "grid", gap: 20 }}>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
      <Box label="Unchecked" />
      <Box label="Checked" defaultSelected />
      <Box label="Indeterminate" isIndeterminate />
      <Box label="Disabled" isDisabled />
    </div>
    <A.CheckboxGroup defaultValue={["failed"]}>
      <A.Label>Notify me about</A.Label>
      <Box value="failed" label="Failed operations" />
      <Box value="invites" label="Accepted invitations" />
    </A.CheckboxGroup>
  </div>,
);
