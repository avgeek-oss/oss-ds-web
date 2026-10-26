# DateRangePicker

The HeroUI date range picker: start and end segmented inputs with a `RangeCalendar` popover.

## When to use

- A date-only interval, such as a reporting period. Use `DateTimeRangePicker` when the interval includes times.

## What the consumer provides

- `value`/`defaultValue` `{ start, end }` (`CalendarDate`) and `onChange`.
- Compound parts: a `Label` and `DateField.Group` › `DateField.InputContainer` with two `DateField.Input`s (`slot="start"` and `slot="end"`, each with an `aria-label`) and `DateRangePicker.RangeSeparator`. Then a `DateField.Suffix` holding `DateRangePicker.Trigger` (`aria-label`), and `DateRangePicker.Popover` containing a `RangeCalendar`.

## Key props

- `isDisabled`, `isReadOnly`, `isInvalid`, `minValue`/`maxValue`, and the group `variant`.

## Do / Don't

- Do label the start and end inputs and the trigger, for example "Choose date range".
- Apps own validation of retention limits and persistence.
