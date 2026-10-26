# ApiKeysSettings

The API keys table with a confirmed Revoke action per key.

## When to use

On the API Keys page; pair with `CreateApiKeyDialog` for creation. MCP Connections live on their own page below it.

## What the consumer provides

`items` (`ApiKey`: `id`, `name`, nullable `expiresAt`, optional `tokenHint`, `permissions`, `createdAt`, `lastUsedAt`), `formatDate`, awaited `onRevoke(id)`, optional extra row `actions`, `emptyDescription`.

## Key behavior

- Expired keys show an Expired label; `status` descriptors are accepted but not displayed.
- Revoke confirms: "Any script or app using this key will lose access immediately."

## Do / Don't

- Await the real API call in each callback and update `items`/`value` only after it succeeds.
- Report a failed mutation once, as a danger toast at bottom center; dialogs stay open with the draft retained.
- Keep the standard headings, labels and confirmation copy.
