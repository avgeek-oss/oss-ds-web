# DateTimeRangePicker

Date-and-time interval picker with separate start and end time controls.

**Use for** intervals with times, such as maintenance windows. Use `DateRangePicker` for date-only.

**Props** controlled `value` / `onChange` (`CalendarDateTime`), `label`, `variant`, optional `hourCycle`, `granularity`, `locale`.

**Don't** rely on it for time zones or UTC serialization; the app owns both.
