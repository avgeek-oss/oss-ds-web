// @dsCard group="Pickers" height=200
import * as React from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
function Due() {
  const [value, setValue] = React.useState<string | null>("2026-10-16");
  return (
    <A.DatePickerField label="Due date" value={value} onChange={setValue} />
  );
}
mount(
  <div style={{ padding: 16, display: "grid", gap: 16, maxWidth: 320 }}>
    <Due />
    <A.DatePickerField
      label="Start date"
      value={null}
      onChange={() => {}}
      isDisabled
    />
  </div>,
);
