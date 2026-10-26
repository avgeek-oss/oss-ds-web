# Input

The HeroUI single-line text input, re-exported unchanged.

## When to use

- Free-text entry: names, email addresses, URLs, numbers and search.
- Use `PasswordInput` for secrets, `Textarea` for multi-line text, `InputGroup` for prefixes and suffixes, and `Select`, `ComboBox` or `Autocomplete` for choosing from a list.

## What the consumer provides

- Native input attributes (`type`, `value`/`defaultValue`, `onChange`, `placeholder`, `required`, `disabled`, `readOnly`) and an accessible name: a `<label>`, `Label` or `aria-label`.
- Mark invalid fields with `aria-invalid`.

## Key props

- `variant`: `primary` (default) or `secondary`. `fullWidth`.

## Do / Don't

- Do use `primary` on base and auth pages, and `secondary` inside widgets, modals and drawers.
- Do wrap the input in `Field` with a label and description, linked through `aria-describedby`.
- Don't override the font size. Text-entry controls stay 16px on mobile to prevent focus zoom.
