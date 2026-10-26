# PasskeySettings

Lists passkeys with add, rename, remove and recovery-code replacement.

## When to use

The Passkeys section of account security. Call it Passkeys.

## What the consumer provides

`items` (`id`, `name`, `createdAt`), `formatDate`, awaited `onAdd(name)` and `onRemove(id)`, optional `onRename`, `onReplaceRecoveryCodes`, `maxNameLength`. To show newly generated codes pass both `recoveryCodes` and `onDismissRecoveryCodes`. The app owns WebAuthn registration and code generation.

## Key behavior

- Unsupported capabilities (rename, replace codes) are omitted by not passing their callback.
- Recovery replacement appears only when the list is non-empty.

## Do / Don't

- Await the real API call in each callback and update `items`/`value` only after it succeeds.
- Report a failed mutation once, as a danger toast at bottom center; dialogs stay open with the draft retained.
- Keep the standard headings, labels and confirmation copy.
