# ToggleButton

A HeroUI on/off button, alone or in a `ToggleButtonGroup` for a single or multiple choice among a few options.

## When to use

- Pressed-state options such as Compare or a Day/Week/Month range switch.
- Use `Switch` for a setting that persists, `Tabs` for switching views, and `Button` for one-shot actions.

## What the consumer provides

- `children`, `isSelected`/`defaultSelected` and `onChange`; in a group, an `id` per button.
- `ToggleButtonGroup`: `selectionMode` (`single` or `multiple`), `selectedKeys`/`defaultSelectedKeys`, `onSelectionChange`, and an `aria-label`.

## Key props

- `variant`: `default` or `ghost`. `size`: `sm`, `md` (default), `lg`. `isDisabled`, `isIconOnly`.

## Do / Don't

- Do label the group with `aria-label` when there is no visible heading.
- Don't use a toggle to trigger a mutation; use a button.
