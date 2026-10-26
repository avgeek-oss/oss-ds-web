# TimeField

The HeroUI segmented time input.

## When to use

- Times of day on their own. `DateTimeRangePicker` already includes start and end time controls, so use it for date-and-time intervals.

## What the consumer provides

- `value`/`defaultValue` as an `@internationalized/date` `Time`, and `onChange`.
- Compound parts: a `Label` and `TimeField.Group` (with `variant` and `fullWidth`) containing `TimeField.Input`, which renders `TimeField.Segment`.

## Key props

- `hourCycle` (12 or 24), `granularity` (`hour`, `minute`, `second`), `shouldForceLeadingZeros`, `isDisabled`, `isReadOnly`, and the group `variant` (`primary` or `secondary`).

## Do / Don't

- Do follow the account's time-format preference when choosing `hourCycle`.
- Don't store display formats. Apps own time zones and UTC conversion.
