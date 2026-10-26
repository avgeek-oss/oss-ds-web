// @dsCard group="Forms" height=168
import * as React from "react";
import type { ComponentProps } from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
function Role(props: {
  label: string;
  initial: ComponentProps<typeof A.ChoiceField>["value"];
  isDisabled?: boolean;
  isRequired?: boolean;
}) {
  const [value, setValue] = React.useState(props.initial);
  return (
    <A.ChoiceField
      label={props.label}
      value={value}
      onChange={setValue}
      options={A.teamRoleOptions}
      isDisabled={props.isDisabled}
      isRequired={props.isRequired}
    />
  );
}
mount(
  <div style={{ padding: 16, display: "grid", gap: 16, maxWidth: 384 }}>
    <Role label="Role" initial="member" isRequired />
    <Role label="Default role for invitations" initial="viewer" isDisabled />
  </div>,
);
