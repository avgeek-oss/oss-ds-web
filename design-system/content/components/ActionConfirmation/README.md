# ActionConfirmation

A confirmation modal for a consequential action that awaits the action, locks repeat presses and stays open on failure.

## When to use

Use ActionConfirmation for a yes/no consequence prompt ("Remove member?"). `AsyncActionButton` with `confirmation` wires one to a button for you. Use `Modal` when the confirmation needs fields.

## What the consumer provides

Controlled `isOpen` / `onOpenChange`, a question `title`, a one-sentence `description`, and `onConfirm` — a promise that rejects on failure and resolves only on success. The app owns refresh and success navigation.

## Key props

- `title`, `description`, `confirmLabel` (default Confirm), `cancelLabel` (default Cancel), `variant` (default `danger`), `onConfirm`.
- While pending the confirm label reads "Please wait…" and the dialog cannot be dismissed.

## Do / Don't

- Do name the action on the confirm button ("Remove member").
- Don't catch a failed request and resolve anyway; failure shows one danger toast and keeps the dialog open.
