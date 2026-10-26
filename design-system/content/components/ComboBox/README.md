# ComboBox

The HeroUI combo box: an editable input that filters a `ListBox` as people type.

## When to use

- Long lists where people may type the value, such as time zones. Use `Select` for a short fixed list, and `Autocomplete` for a searchable picker with a non-editable trigger.

## What the consumer provides

- Compound parts: a `Label` and `ComboBox.InputGroup` containing an `Input` and `ComboBox.Trigger` (`aria-label`). Then `ComboBox.Popover` containing a `ListBox` of items.
- `selectedKey`/`defaultSelectedKey`, `onSelectionChange`, `inputValue` and `onInputChange` as needed.

## Key props

- `variant`: `primary` (default) or `secondary`. `isDisabled`, `isRequired`, `isInvalid`.

## Do / Don't

- Do give the trigger an accessible label such as "Show options".
- The editable input keeps the 16px mobile text size; don't shrink it.
