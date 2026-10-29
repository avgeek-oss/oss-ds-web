# Application patterns

Apps fetch, authorize and persist; patterns own layout, copy and states.

## Shared behavior

- Await the real mutation; resolve only on success and reject on failure.
- Report a failed mutation with one bottom-center danger toast; never also show it inline.
- Keep dialogs and drafts open after a failure; close only after success.
- Use `AsyncActionButton` for an awaited action, with `confirmation` for consequence dialogs.
- Map domain statuses to `StatusIndicator` with a label, chip color and optional icon.
- Use `ChoiceField` for role, permission and expiry choices; plain `Select` otherwise.

## Account settings

- `ProfileSettings` is the Profile details widget; supply `value` and `onSave`.
- `EmailChangeSettings` shows the current email, a pending change and resend cooldown.
- `PasswordChangeSettings` checks confirmation first; set `requireCurrentPassword` from your auth policy.
- `PasskeySettings`: omit `onRename` or `onReplaceRecoveryCodes` when unsupported.
- `ApiKeysSettings` lists keys with awaited revocation; never store raw tokens.
- `CreateApiKeyDialog` requires explicit Permissions and Expires after choices; it never defaults them.
- Keep MCP Connections on its own page below API Keys; use `McpGuideSettings` for client setup with `mcpClientConfigurations({ serverName, url })`.

## Team settings

- `MembersTable` shows identity, role, account and security status; supply roles and row actions.
- `InviteMemberDialog` shows the invitation link only after success.
- Use `MemberEditDialog mode="role-only"` when admins may change access but not profiles.
- Use `InvitationsTable` with copy, resend and revoke callbacks.
- Use `RemoveMemberDialog` and `RevokeInvitationDialog` for the standard confirmations.
- Use `TeamGeneralSettings`; set `mode="details"` only if the server stores a description.
- Use `teamRoleOptions` for Admin, Member and Viewer pickers.

## Data and history

- Use `HistoryTable` for paginated history with loading, error and filter states.
- Use `ResourceTable` for a plain record list.
- Compose `HistorySearch` and `HistoryFilter` above `HistoryTable`; pass the applied search, such as one from the URL, as `HistorySearch` `value`.
- `FilterDialog` keeps a draft until Apply; Cancel keeps committed filters. The app defines fields and operators.
- Use `ExpandableAttributeList` when only some rows have details; `Attributes` when none do.

## Assistant

- Put `AgentChat` in `AppLayout`'s `aside` and `AgentChatTrigger` in `ApplicationNavbar`'s `actions`.
- Give each tool a short action label through `describeTool`; add `detail` when an approval needs its consequence.
- Approvals appear inline; the server decides which tools need them. A new message declines waiting actions.
- Replies render a Markdown subset; raw HTML is never interpreted.

## Notifications and operations

- `NotificationMenu` shows incoming notifications; use its explicit **Mark all as read**.
- Opening the menu never marks events read; read state lives on the server.
- `NotificationDestinationsSettings` configures outgoing notifications per destination and category.
- `OperationProgress` shows ordered background steps; failed steps open with details.

## Auth

- Use `SignIn`, `ForgotPassword`, `VerificationEmail`, `PasswordSetup` and `PasskeyVerification` for public auth.
- Use `AcceptInvitation` when invitations need email-code verification; `InvitationPasswordSetup` when the link proves identity.
- Use `PasskeyRecoveryVerification` after a password passes with a pending passkey challenge.
- Use `ConfirmIdentityDialog` for step-up checks; `method="custom"` for app-owned ceremonies.

## Errors and loading

- Use `ErrorPage` for routes that cannot render; never show raw exception details.
- Use `QueryError` for a failed query within a usable page; `EmptyState` for no records.
- Use `QueryLoading` for initial loads; keep stale data visible during refreshes.
- Use `BackendUnavailable` when the backend cannot serve the session; don't redirect to sign-in.
