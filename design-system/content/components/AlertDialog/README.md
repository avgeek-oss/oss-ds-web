# AlertDialog

A compact, assertive dialog for consequential confirmations, with a danger action and a secondary Cancel.

## When to use

Use AlertDialog when you compose a destructive confirmation yourself. Prefer `ActionConfirmation`, which wraps the same flow with pending and failure handling; use `Modal` for forms.

## What the consumer provides

Controlled `isOpen` / `onOpenChange`, a question heading ("Revoke session?"), one sentence of consequence, and the actions.

## Key props

- Parts mirror Modal: `AlertDialog.Backdrop` > `Container` (`size`) > `Dialog` > `Header` (`Heading`, `CloseTrigger`), `Body`, `Footer`.

## Do / Don't

- Do phrase the heading as a question and name the action on the confirm button.
- Don't use a primary (accent) button for a destructive confirm; use `danger`.
