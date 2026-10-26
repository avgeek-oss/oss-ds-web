# DatePicker

The HeroUI date picker: a segmented `DateField.Group` with a trigger that opens a `Calendar` popover.

## When to use

- Calendar entry of a single date. Use `DateField` for typed entry alone, and `DateRangePicker` or `DateTimeRangePicker` for intervals.

## What the consumer provides

- `value`/`defaultValue` (`CalendarDate`) and `onChange`.
- Compound parts: a `Label` and `DateField.Group` (`variant`, `fullWidth`) with `DateField.Input`/`DateField.Segment` and a `DateField.Suffix` holding `DatePicker.Trigger` › `DatePicker.TriggerIndicator`. Then `DatePicker.Popover` containing a `Calendar` (header, grid, cells).

## Key props

- `isInvalid`, `isDisabled`, `isReadOnly`, `minValue`/`maxValue`, and the group `variant` (`primary` or `secondary`).

## Do / Don't

- Do persist date-only values as ISO date strings.
- Don't build a separate popover calendar; compose this one.
