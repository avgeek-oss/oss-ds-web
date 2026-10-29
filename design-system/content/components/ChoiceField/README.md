# ChoiceField

Labelled single-choice picker whose options carry an icon, description and trailing metadata.

**Use for** roles and permissions in dialogs (pass `teamRoleOptions` for Admin/Member/Viewer) and app pickers such as assignees, with `search` for long lists. Use `Select` for other compositions.

**Provide** `label`, `value`, `onChange`, `options` (`{ id, label, description?, icon?, endContent?, muted? }`), and optionally `search`, `hideLabel`, `description`, `fullWidth`.

**Don't** redefine role copy; reuse `teamRoleOptions`.
