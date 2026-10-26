# SessionsSettings

Signed-in browser sessions with per-session revoke.

**Use for** the Sessions section of account security. The current session can't be revoked here.

**Provide** `items` (`id`, `name`, `lastActive`, `expiresAt`, `current`), `formatDate`, awaited `onRevoke(id)`.

**Don't** change the confirmation copy; report failures as one danger toast.
