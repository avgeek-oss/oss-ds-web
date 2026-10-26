# Textarea

The HeroUI multi-line text field (HeroUI `TextArea`, exported as `Textarea`).

## When to use

- Descriptions, notes and other multi-line free text. Use `Input` for a single line.

## What the consumer provides

- Native textarea attributes (`rows`, `value`/`defaultValue`, `onChange`, `placeholder`, `disabled`) and an accessible name.
- Mark invalid fields with `aria-invalid`.

## Key props

- `variant`: `primary` (default) or `secondary`. `fullWidth`.

## Do / Don't

- Do use the `secondary` surface inside widgets, modals and drawers.
- Don't show a submission failure under the field. Failures are reported in one toast.
