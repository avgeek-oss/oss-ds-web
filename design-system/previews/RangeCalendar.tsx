// @dsCard group="Pickers" height=304
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const date = A.parseDate("2026-10-06");
mount(
  <div style={{ padding: 16 }}>
    <A.RangeCalendar
      aria-label="Reporting period"
      defaultValue={{ start: date, end: date.add({ days: 6 }) }}
    >
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
          {(d) => <A.RangeCalendar.Cell date={d} />}
        </A.RangeCalendar.GridBody>
      </A.RangeCalendar.Grid>
    </A.RangeCalendar>
  </div>,
);
