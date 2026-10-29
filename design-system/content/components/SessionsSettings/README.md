# SessionsSettings

Signed-in browsers and devices, with Sign out per session and Sign out everywhere.

**Use for** the Sessions page of account settings.

**Provide** `items` (`id`, `name`, optional `detail` and `signedInAt`, `lastActive`, `expiresAt`, `current`), `formatDate`, awaited `onSignOutCurrent`, optional `onSignOut(id)` and `onSignOutEverywhere`.

**Don't** show actions the backend can't do; omit their callbacks.
