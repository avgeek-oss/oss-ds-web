# SessionsSettings

Lists signed-in browser sessions with per-session revoke.

## When to use

The Sessions section of account security.

## What the consumer provides

`items` (`id`, `name`, `lastActive`, `expiresAt`, `current`), `formatDate`, awaited `onRevoke(id)`.

## Key behavior

- Confirmation uses **Revoke session** / **Keep session**: "That browser will lose access immediately and must sign in again."
- The current session cannot be revoked here.

## Do / Don't

- Await the real API call in each callback and update `items`/`value` only after it succeeds.
- Report a failed mutation once, as a danger toast at bottom center; dialogs stay open with the draft retained.
- Keep the standard headings, labels and confirmation copy.
