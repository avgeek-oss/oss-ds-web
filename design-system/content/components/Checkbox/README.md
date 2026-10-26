# Checkbox

The HeroUI checkbox, with a `CheckboxGroup` for a labelled set of options.

## When to use

- Independent yes/no options, or several choices from a short list.
- Use `Switch` for a setting that applies immediately, and `Select` or `ChoiceField` for one option from many.

## What the consumer provides

- Compound parts: `Checkbox.Content`, `Checkbox.Control`, `Checkbox.Indicator` and a `Label`.
- `isSelected`/`defaultSelected`, `onChange`, and a `value` inside a group.
- `CheckboxGroup`: `value`/`defaultValue`, `onChange` and a `Label`.

## Key props

- `variant`: `primary` (default) or `secondary`. `isIndeterminate`, `isDisabled`, `isInvalid`.

## Do / Don't

- Do write labels as plain sentence-case statements.
- Don't use a checkbox to trigger an immediate mutation.
