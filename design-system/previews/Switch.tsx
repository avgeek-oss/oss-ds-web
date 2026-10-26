// @dsCard group="Forms" height=232
import type { ComponentProps } from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
function Toggle({
  label,
  ...props
}: ComponentProps<typeof A.Switch> & { label?: string }) {
  return (
    <A.Switch {...props}>
      <A.Switch.Control>
        <A.Switch.Thumb />
      </A.Switch.Control>
      {label ? (
        <A.Switch.Content>
          <A.Label>{label}</A.Label>
        </A.Switch.Content>
      ) : null}
    </A.Switch>
  );
}
mount(
  <div style={{ padding: 16, display: "grid", gap: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <Toggle size="sm" aria-label="Small switch" defaultSelected />
      <Toggle size="md" aria-label="Medium switch" defaultSelected />
      <Toggle size="lg" aria-label="Large switch" defaultSelected />
    </div>
    <div style={{ display: "grid", gap: 12 }}>
      <Toggle label="Email notifications" defaultSelected />
      <Toggle label="Weekly summary" />
      <Toggle label="Require passkeys" isDisabled />
    </div>
  </div>,
);
