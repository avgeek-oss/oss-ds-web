# Select

The HeroUI select with a `ListBox` popover, for picking one option from a known list.

## When to use

- An ordinary choice from a short or medium list. Use `Autocomplete` (with `SearchField`) when people need to search, `ComboBox` when they may type, and `ChoiceField` for the standard labelled role or option picker.

## What the consumer provides

- Compound parts: a `Label`, `Select.Trigger` containing `Select.Value` and `Select.Indicator`, and `Select.Popover` containing a `ListBox` of `ListBox.Item` (`id`, `textValue`, `ListBox.ItemIndicator`).
- `selectedKey`/`defaultSelectedKey` and `onSelectionChange`.

## Key props

- `variant`: `primary` (default) or `secondary`. `isDisabled`, `isRequired`, `isInvalid`, `fullWidth`.

## Do / Don't

- Do keep values and options at 14px on every breakpoint, as shipped.
- Don't round the popover yourself. Its radius is the field radius plus the 8px inset.
- Do truncate long labels and keep trailing metadata in a separate `shrink-0` slot clear of the tick.
