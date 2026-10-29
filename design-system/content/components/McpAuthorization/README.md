# McpAuthorization

The MCP consent screen: the client, where it returns to, what it acts on, a role ceiling and Deny/Approve.

**Use for** an MCP client asking for access through the app's OAuth server. Ceilings above the person's own role are disabled; a loopback redirect shows a warning. The preview's mark is a stand-in.

**Provide** `brand`, `productName`, `client` (`name`, `redirectHost`, `localhost`, optional `logo`/`logoUri`), `resources`, controlled `ceiling`, `ceilings`, `onCeilingChange`, optional `workspace`, `onApprove`, `onDeny`.

**Don't** show raw scopes or OAuth metadata. `ConnectedMcpConsent` loads the request and sends the decision.
