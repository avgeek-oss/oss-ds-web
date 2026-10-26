# Modal

A dialog for forms and multi-step flows with the shared 20px padding.

**Use for** forms and confirmation flows. Use `ActionConfirmation` for a yes/no prompt, `Popover` for contextual content.

**Props** `Modal.Backdrop` (`isOpen`, `onOpenChange`) > `Container` (`size` sm · md · lg) > `Dialog` > `Header`, `Body`, `Footer`.

**Don't** close before the mutation succeeds; use `secondary` inputs and Cancel inside.
