# ChoiceField

The standard labelled single-choice picker: a secondary `Select` whose options can carry an icon and a description line.

## When to use

- Choosing a role, permission or other small option set with explanations, as in team and API-key dialogs. Pass `teamRoleOptions` for the common Admin/Member/Viewer picker. Use a bare `Select` when options need no descriptions.

## What the consumer provides

- `label`, controlled `value`, `onChange(value)`, and `options` (`ChoiceOption[]`: `{ id, label, description?, icon? }`).
- Optional `isDisabled` and `isRequired`.

## Key props

- Always the `secondary` surface, since it is designed for dialogs and widgets.

## Do / Don't

- Do reuse `teamRoleOptions` rather than redefining role copy.
- Rendering a role does not grant access; apps enforce permissions.
