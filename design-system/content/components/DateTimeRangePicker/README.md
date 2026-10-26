# DateTimeRangePicker

The shared date-and-time interval picker: segmented start and end inputs and a range calendar popover with separate start and end time controls.

## When to use

- Any interval with times, such as maintenance windows or history filters. Use `DateRangePicker` for a date-only interval.

## What the consumer provides

- Controlled `value` `{ start, end }` as `CalendarDateTime`, and `onChange`.
- A `label`, the surface `variant` (`primary` or `secondary`), and optional `minValue`/`maxValue`, `hourCycle`, `granularity` (`minute` default, or `second`), and `locale`.

## Key props

- All `DateRangePicker` props except `children`. `isDisabled`, `isReadOnly`, `isInvalid`.

## Do / Don't

- Do let `hourCycle`, `granularity` and `locale` change only the display; stored values are unchanged.
- The segmented inputs stack at mobile widths.
- Apps own the saved time zone, ambiguous daylight-saving resolution, UTC serialization, retention limits and persistence.
