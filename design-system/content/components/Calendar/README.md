# Calendar

The HeroUI inline month calendar for picking one date. It also forms the body of the `DatePicker` popover.

## When to use

- An always-visible calendar. Use `DatePicker` for a field with a popover, and `RangeCalendar` for intervals.

## What the consumer provides

- `value`/`defaultValue` (`CalendarDate`), `onChange` and an `aria-label`.
- Compound parts: `Calendar.Header` (`Calendar.NavButton` with `slot="previous"`, `Calendar.Heading`, `Calendar.NavButton` with `slot="next"`), then `Calendar.Grid` containing `Calendar.GridHeader` (render `Calendar.HeaderCell`) and `Calendar.GridBody` (render `Calendar.Cell`).

## Key props

- `isDisabled`, `isReadOnly`, `minValue`/`maxValue`, `isDateUnavailable`.

## Do / Don't

- Do keep native selected, today and disabled styling.
- Don't restyle cells per app.
