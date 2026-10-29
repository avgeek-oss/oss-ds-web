# ApiKeysSettings

API keys table with role ceilings, workspace, expiry, last use, Rotate and Revoke.

**Use for** the API Keys page, with `CreateApiKeyDialog` for creation. A key acts with the lower of its ceiling and its owner's role.

**Provide** `items` (the auth client's `ApiKey`), `formatDate`, optional `workspaceLabel`, awaited `onRevoke(id)` and `onRotate(id, graceSeconds)` resolving to the new secret.

**Don't** show the secret anywhere but the reveal-once dialog. `ConnectedApiKeysSettings` does the requests and step-up.
