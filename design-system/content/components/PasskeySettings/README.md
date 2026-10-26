# PasskeySettings

Lists passkeys with add, rename, remove and recovery-code replacement.

**Use for** the Passkeys section of account security. Omit a callback to hide that capability.

**Provide** `items`, `formatDate`, awaited `onAdd(name)` and `onRemove(id)`, optional `onRename`, `onReplaceRecoveryCodes`, `recoveryCodes` with `onDismissRecoveryCodes`.

**Don't** update `items` before the API call succeeds.
