# Switch

The HeroUI on/off switch for settings that take effect as they change.

## When to use

- Preferences such as notifications. Use `Checkbox` for options that are submitted with a form, and `ToggleButton` for pressed-state view controls.

## What the consumer provides

- Compound parts: `Switch.Control` with `Switch.Thumb`, and optionally `Switch.Content` with a `Label`. Without a visible label, give it an `aria-label`.
- `isSelected`/`defaultSelected` and `onChange`.

## Key props

- `size`: `sm`, `md` (default), `lg`. `isDisabled`.

## Do / Don't

- Do await the persistence call and keep the previous value when it fails, with one danger toast.
- Don't label a switch with a question; name the setting.
