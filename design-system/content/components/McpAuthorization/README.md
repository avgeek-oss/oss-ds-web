# McpAuthorization

The shared MCP client consent form: application, scope picker and Deny/Approve.

**Use for** an MCP client requesting access through the app's OAuth flow. Requests start at Read-only. The preview's mark is a stand-in.

**Provide** `brand`, `productName`, `clientName`, controlled `accessLevel`, `availableAccessLevels`, `onAccessLevelChange`, `onApprove`, `onDeny`.

**Don't** show OAuth metadata, expiry or raw permission lists in the form.
