# AsyncActionButton

A `Button` that awaits `onAction`, disables itself and shows a pending label until the request settles, and can ask for confirmation first.

## When to use

- One awaited mutation behind a single button, for example Save changes, Resend invitation or Revoke session.
- Use a plain `Button` when nothing is awaited. Use `ActionConfirmation` on its own when another control opens the dialog.

## What the consumer provides

- `onAction: () => Promise<void>`, which resolves after the server succeeds and rejects with an `Error` on failure.
- Optional `pendingLabel` (default "Please wait…") and `confirmation` `{ title, description, confirmLabel, cancelLabel, variant }`, shown as a confirmation modal before the action.
- All other `Button` props except `onPress`.

## Key props

- Inherits `variant`, `size` and `isDisabled` from `Button`. The confirmation modal's button variant defaults to `danger`.

## Do / Don't

- Do throw a meaningful `Error`. A rejection shows one danger toast with its message, falling back to "Could not complete the action".
- Don't also show the failure inline, and don't add your own pending state. Repeat presses are already locked.
- Do phrase confirmations as a question followed by the consequence: "Revoke session?" — "That browser will lose access immediately and must sign in again."
