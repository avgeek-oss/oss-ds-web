# RangeCalendar

The HeroUI inline calendar for selecting a start and end date. It also forms the body of the `DateRangePicker` popover.

## When to use

- An always-visible interval picker. Use `Calendar` for one date.

## What the consumer provides

- `value`/`defaultValue` `{ start, end }` (`CalendarDate`), `onChange` and an `aria-label`.
- Compound parts as in `Calendar`: `RangeCalendar.Header`, `NavButton`, `Heading`, `Grid`, `GridHeader`/`HeaderCell` and `GridBody`/`Cell`. Optional `YearPickerTrigger` and `YearPickerGrid` parts, as used in `DateTimeRangePicker`.

## Key props

- `isDisabled`, `isReadOnly`, `minValue`/`maxValue`, `allowsNonContiguousRanges`.

## Do / Don't

- Do keep the native range fill and endpoint treatment.
