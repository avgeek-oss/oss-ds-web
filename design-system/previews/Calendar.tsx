// @dsCard group="Pickers" height=280
import type { ComponentProps } from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
function Month(props: ComponentProps<typeof A.Calendar>) {
  return (
    <A.Calendar {...props}>
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
  );
}
const date = A.parseDate("2026-10-06");
mount(
  <div
    style={{
      padding: 16,
      display: "flex",
      flexWrap: "wrap",
      gap: 32,
      alignItems: "start",
    }}
  >
    <Month aria-label="Choose date" defaultValue={date} />
    <Month aria-label="Disabled calendar" defaultValue={date} isDisabled />
  </div>,
);
