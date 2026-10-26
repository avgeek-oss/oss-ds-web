# Field

Layout helpers that stack a label, control, description and error with the shared 6px gap. `FieldGroup` and `FieldSet` space fields 16px apart.

## When to use

- Around any form control that needs a visible label, a description or a validation message.

## What the consumer provides

- `Field` (div), `FieldLabel` (label, with `htmlFor` and optional `isRequired` to add a danger asterisk), `FieldDescription`, `FieldError` (`role="alert"`).
- Also `FieldGroup`, `FieldSet`, `FieldLegend`, `FieldContent`, `FieldTitle` and `FieldSeparator`.
- Link the control to its text with `id` and `aria-describedby`.

## Key props

- `FieldLabel.isRequired`. All parts accept their element's native props and `className`.

## Do / Don't

- Do use `FieldError` for field validation, in `danger-soft-foreground` at 12px.
- Don't use `FieldError` for a failed submission. Report that with one danger toast.
