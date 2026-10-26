# AlertDialog

Compact dialog for consequential confirmations, with a danger action and Cancel.

**Use for** a destructive confirmation you compose yourself. Prefer `ActionConfirmation`; use `Modal` for forms.

**Props** controlled `isOpen` / `onOpenChange`; parts mirror Modal (`Header`, `Body`, `Footer`).

**Don't** use an accent button for a destructive confirm; use `danger`.
