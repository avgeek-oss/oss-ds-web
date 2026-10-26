# DateField

The HeroUI segmented date input, without a popover.

## When to use

- Typed date entry where a calendar is unnecessary. Use `DatePicker` for calendar entry and `Calendar` for an inline calendar.

## What the consumer provides

- `value`/`defaultValue` as an `@internationalized/date` `CalendarDate`, and `onChange`.
- Compound parts: a `Label` and `DateField.Group` (takes the surface `variant` and `fullWidth`) containing `DateField.Input`, which renders `DateField.Segment` for each segment.
- Persist date-only values as ISO date strings.

## Key props

- Group `variant`: `primary` or `secondary`. `isDisabled`, `isReadOnly`, `isInvalid`, `minValue`/`maxValue`, `granularity`.

## Do / Don't

- Do apply the surface variant to `DateField.Group`, not the root.
- Don't confuse display preferences with domain DATE serialization; they are separate contracts.
