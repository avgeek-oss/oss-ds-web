# ChoiceField

Labelled single-choice picker whose options carry an icon and description.

**Use for** roles and permissions in dialogs; pass `teamRoleOptions` for Admin/Member/Viewer. Use `Select` when options need no descriptions.

**Provide** `label`, `value`, `onChange`, `options` (`{ id, label, description?, icon? }`).

**Don't** redefine role copy; reuse `teamRoleOptions`.
