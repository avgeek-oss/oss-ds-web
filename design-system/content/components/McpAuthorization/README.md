# McpAuthorization

The shared MCP client consent form: application, scope picker and Deny/Approve.

The preview's brand mark is a stand-in: a 32px `accent` tile with an 8px radius beside the name "Avgeek". Apps pass their own `BrandLockup`.

## When to use

When an MCP client requests access through the app's OAuth flow.

## What the consumer provides

`brand`, `productName`, `clientName`, optional `clientLogo`, controlled `accessLevel` (`read` | `write` | `admin`), role-bounded `availableAccessLevels`, `onAccessLevelChange`, `onApprove`, `onDeny`, optional `isPending`, `isDisabled`, `approvalBlockedReason`. The app validates the selection, derives grants and revokes connections on role changes.

## Key behavior

- Start every request at Read-only, independent of client-requested scopes.
- Back to client calls `onDeny` so the app completes a validated denial.
- Pending state blocks decisions and navigation; an unavailable scope blocks approval but allows denial.

## Do / Don't

- Keep OAuth metadata, expiry and raw permission lists out of the form.
- Report mutation errors with a toast.
