# TextField

Labelled native text input, or a textarea with `multiline`, on the secondary surface.

**Use for** individual text fields in app forms and dialogs. Use `AuthForm` for submitted field sets and `PasswordInput` for passwords.

**Provide** `label`, optional `description` (linked through `aria-describedby`), `hideLabel`, and native input props such as `value`, `onChange`, `required` and `maxLength`.

**Don't** put validation errors in `description`; show field errors with `FieldError`.
