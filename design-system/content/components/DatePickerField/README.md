# DatePickerField

Labelled calendar date that can be cleared, stored as `YYYY-MM-DD`.

**Use for** optional dates such as due dates. Use `DateTimeRangePicker` for ranges with times and `DatePicker` for custom composition.

**Provide** `label`, `value` (`YYYY-MM-DD` or null), `onChange`, optional `isDisabled` and `variant` (secondary by default).

**Don't** convert the value to a timestamp; it is a calendar date without a time zone.
