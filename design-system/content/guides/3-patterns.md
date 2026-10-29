# Application patterns

Apps fetch, authorize and persist; patterns own layout, copy and states.

## Shared behavior

- Await the real mutation; resolve only on success and reject on failure.
- Report a failed mutation with one bottom-center danger toast; never also show it inline.
- Keep dialogs and drafts open after a failure; close only after success.
- Use `AsyncActionButton` for an awaited action, with `confirmation` for consequence dialogs.
- Map domain statuses to `StatusIndicator` with a label, chip color and optional icon.
- Use `ChoiceField` for role and expiry choices; plain `Select` otherwise.

## Account settings

- `ProfileSettings` is read-only: name, email and role come from the identity provider and are changed there.
- `SessionsSettings` signs out this browser; pass `onSignOut` and `onSignOutEverywhere` only when the backend supports them.
- `ApiKeysSettings` shows each key's role ceiling, workspace, expiry and last use, with Rotate (grace period) and Revoke; never store raw secrets.
- `CreateApiKeyDialog` requires explicit Role and Expires after choices, offers ceilings up to the person's role, and shows the secret once.
- Keep MCP Connections on its own page below API Keys; use `McpGuideSettings` for client setup with `mcpClientConfigurations({ serverName, url })`.

## Team settings

- `PeopleDirectory` is the read-only directory mirrored from the provider: role, source, last sign-in and a Suspended badge for people without a role.
- Roles and app access are changed in the identity provider, never in the app; there are no invitations.
- `WorkspaceMembersSettings` edits workspace membership, which the app owns.
- Use `TeamGeneralSettings`; set `mode="details"` only if the server stores a description.
- Use `teamRoleOptions` for Admin, Member and Viewer labels and ceiling pickers.

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

- Sign-in is SSO only: `SignIn` has one "Continue with <provider>" button and shows the redirect error.
- Use `AccessDenied` when the provider has not given someone the app, their role was removed, or they were deactivated.
- Use `StepUpDialog` for `step_up_required`: the person signs in again at the provider and the action finishes on return.
- `McpAuthorization` shows the client, where it returns to, a localhost warning and a role ceiling capped at the person's role.
- `patterns/auth/connected` containers take an `AuthClient` from `@avgeek-oss/auth-client` and do the data work.

## Errors and loading

- Use `ErrorPage` for routes that cannot render; never show raw exception details.
- Use `QueryError` for a failed query within a usable page; `EmptyState` for no records.
- Use `QueryLoading` for initial loads; keep stale data visible during refreshes.
- Use `BackendUnavailable` when the backend cannot serve the session; don't redirect to sign-in.
