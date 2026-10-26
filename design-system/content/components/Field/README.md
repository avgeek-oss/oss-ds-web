# Field

Stacks a label, control, description and error with the shared 6px gap.

**Use for** any form control that needs a visible label, description or validation message. `FieldGroup` and `FieldSet` space fields 16px apart.

**Props** `FieldLabel` (`htmlFor`, `isRequired`), `FieldDescription`, `FieldError`; link the control with `id` and `aria-describedby`.

**Don't** use `FieldError` for a failed submission; report that with one danger toast.
