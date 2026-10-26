# ActionConfirmation

Confirmation modal that awaits the action, locks repeat presses and stays open on failure.

**Use for** a yes/no consequence prompt ("Remove member?"). Use `Modal` when it needs fields.

**Provide** `isOpen`, `onOpenChange`, question `title`, one-sentence `description`, `onConfirm` promise; optional `confirmLabel`, `variant` (default danger).

**Don't** resolve after a failed request; failure shows one danger toast.
