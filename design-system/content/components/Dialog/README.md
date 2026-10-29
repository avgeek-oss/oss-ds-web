# Dialog

Titled modal with a close button, body and optional footer, over `Modal`.

**Use for** app forms and details in a dialog. Use `ActionConfirmation` for a yes/no prompt and compose `Modal` for other structures.

**Provide** `open`, `onClose`, `title` (text or a node), children, optional `footer`, `wide` or `size`, and `isDismissDisabled` while a request is pending.

**Don't** close before the mutation succeeds. Dismissal is ignored while an `OverlaySuspensionScope` suspends the dialog.
