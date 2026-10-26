# ApiKeysSettings

API keys table with a confirmed Revoke action per key.

**Use for** the API Keys page, with `CreateApiKeyDialog` for creation.

**Provide** `items` (`id`, `name`, `expiresAt`, `permissions`, `createdAt`, `lastUsedAt`), `formatDate`, awaited `onRevoke(id)`.

**Don't** update `items` before the API call succeeds; failures show one danger toast.
