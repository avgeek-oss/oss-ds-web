# Shared application patterns

Towbar is the baseline for common application surfaces. Use these exports directly so applications share their layout, interaction states, and presentation contracts. Components receive typed UI data and callbacks; applications adapt server responses, enforce permissions, perform requests, and update committed data.

Import components and their props from the package root or the subpath shown in the catalog. Every component has a separate interactive Storybook fixture. Empty states and simulated failures belong to those fixtures, not to production callbacks.

## Account settings

`EmailChangeSettings` displays the current email and verification status, accepts a new email, and shows a pending change with cancellation. Supply `email`, `isVerified`, optional `pendingChange: { email, expiresAt }`, and request/cancel/resend callbacks. `resendAvailableAt` is a Unix timestamp in milliseconds provided by the app after a successful resend. The component displays the remaining cooldown and disables resending until it expires. Supply `formatDate` to show the pending link's expiry and `error` for a failed data fetch. Email-confirmation token parsing and callback URLs stay in the app. Use `mode="read-only"` when the app cannot change or resend verification; this mode requires no mutation callbacks, keeps the factual verification status, and accepts `children` for provider or administrator guidance.

`PasswordChangeSettings` checks confirmation before calling `onChangePassword`, retains values on failure, and clears password inputs after success. It requires the current password by default. Set `requireCurrentPassword` from the app's authentication policy and supply its minimum/maximum lengths and password guidance. The callback receives `newPassword`, `confirmPassword`, and the current password only when required. The server remains responsible for validating password policy and identity.

`ApiKeysTable` displays an `ApiKey` record: `id`, `name`, nullable `expiresAt`, optional `tokenHint`, permission description, creation/last-use dates, and status. Name and masked key hint occupy at most two lines. There is no separate status column or Active chip. Expires shows the formatted date (or No expiry), with an Expired label alongside elapsed dates; supplied status descriptors remain accepted for compatibility but are not displayed. Long permission descriptions are limited to two lines with their full value available in a tooltip. Pass row actions and a date formatter that returns at most two lines. It retains the table layout on mobile, with horizontal scrolling contained inside the table. `ApiKeysSettings` adds awaited revocation with a consequence confirmation; update its items after a successful revoke. Dismissal returns focus to the connected Revoke action including late native row/cell restoration. Recovery ends on new input, focus elsewhere, window blur, reopen or unmount; disconnected openers are skipped. Preserve locally acknowledged revocations when reconciling delayed server responses.

`AuthorizedClientsTable` uses the same credential metadata plus `client: { name, id?, logo?, trust? }`. It retains the table layout on mobile, with horizontal scrolling contained inside the table. Codex clients display the Codex name and ChatGPT logo, including existing connections identified by a ChatGPT Codex metadata URL. Other clients retain the supplied name and logo. Client trust is supplied explicitly; a name or logo does not establish trust. Compose revocation with `AsyncActionButton` and app-appropriate consequence copy.

`CreateApiKeyDialog` collects required Name, Permissions and Expires after fields. Permissions use the exported `apiKeyPermissionOptions`: Read-only, Edit and Administrative permissions. Expiry uses `apiKeyExpiryOptions`: 30 days, 90 days, 1 year and Never. Both selectors start empty and require an explicit selection; the dialog never defaults a key's authority or lifetime. Apps may pass filtered option arrays to reflect the caller's allowed policies. The callback receives all three fields in `CreateApiKeyValues`; the app maps them to its server contract, validates authority, computes expiry and retains an idempotency key for retries. The callback returns `{ token: string | null }`. A string opens the save-once view; null explains that an earlier request already created the key without revealing its token again. Closing unmounts the form and token display. Never include a raw token in table records, persistent state, fixture logs, or analytics. Use the `children` slot for additional scope controls; the app reads those values in its creation callback.

## Team settings

`MembersTable` displays identity, role, account status, and security status. `Member` accepts `accountStatus` and `securityStatus` as status descriptors; supply Towbar's account readiness and 2FA state without inferring 2FA from passkey presence. Optional `emailVerified` flags an unverified address. The legacy `passkeyEnabled` display is retained for existing consumers that do not supply security status. Supply role options to label the app's allowed roles, and row actions to edit or remove access.

`InviteMemberDialog`, `AddMemberDialog`, and `MemberEditDialog` are separate public components. Each accepts controlled open state and allowed role options. Invitation creation collects email/role and displays the returned invitation URL only after success. The result uses neutral private-link guidance and makes no assumption about email verification or delivery. Supply `resultGuidance` for the actual delivery state or joining requirements. The app owns success toasts and delivery warnings. Direct member creation collects name/email/temporary password/role. Editing collects name and role by default. Set `MemberEditDialog` to `mode="role-only"` when an administrator can change access but cannot edit another person’s profile; its callback receives only `{ role }`. Failed requests keep the dialog and draft open. Apps own last-admin rules, identity verification, temporary-password policy, and access-revocation consequences.

`InvitationsTable` displays an email-based `UserAvatar`, optional name, email, role, expiry, and optional status. `MembersTable.currentUserId` labels the matching identity as “(you)” without altering the underlying member name. Supply copy-link, resend, and revoke callbacks for the corresponding actions, or compose custom row actions. Resend confirms that the previous link will stop working; revocation confirms that the selected invitation will no longer work. The app filters expired/revoked invitations and supplies a date formatter.

## History and filters

Use `HistoryTable` when a resource list needs history pagination and loading/error/filter states. Use `ResourceTable` for a plain record list without those behaviors. History records only require an `id`; columns describe their actual fields, so audit events and delivery attempts need not share a backend payload. `HistoryPagination` accepts a one-based page and either a known total or previous/next availability. During refresh, existing rows remain visible and page changes are blocked. Retry is an app callback. Cursor encoding, fetching, polling, and filter serialization stay in the app.

`HistorySearch` submits a trimmed search and resets it immediately when cleared. `HistoryFilter` selects one option with optional search, icons, and trailing metadata. Its search field has an 8px popover inset. Supplied avatars retain their size in both menu rows and selected values; ordinary SVG icons use 16px. The empty string represents All; option IDs must not use the reserved `all` ID. Both controls compose above `HistoryTable`.

`EventDetailsDialog` accepts `EventDetailField` records with stable IDs, labels, values, and optional copying. Use `EventDetail` children when additional detail content needs composition. Copying is available only for string values. Long values wrap inside the dialog.

`FilterDialog` maintains a draft until Apply; Cancel preserves the committed conditions. Define each field's label, allowed operators, input constraints, and whether it is searchable. Operators with `multiple: true` use a multi-value picker when a `getOptions` callback is supplied. Single-value operators use an input. The app defines operator meanings and implements search. Selected values remain available when suggestions change, stale search responses are ignored, and duplicate conditions are removed on Apply. Supply stable `getOptions` and `renderOption` callbacks. No field or operator is inferred from a project's API.

Filter condition rows reserve an automatic-width column for the native medium delete button, with a circular `danger-soft` treatment. Do not constrain it to a smaller fixed grid track: touch sizing must fit too. Add condition includes a plus icon. Condition inputs stack below 640px and their wrappers must shrink without horizontal scrolling or clipping controls. Domain-specific filter adapters follow the same layout while retaining their own operators and validation.

## Incoming notifications

`NotificationMenu` presents the notification trigger, badge, popover and rows. Use the explicit **Mark all as read** action. Opening the menu only refreshes it; it does not acknowledge or delete events. Notification read state belongs to the server, not local storage. The notification trigger keeps its geometry during pointer, touch and keyboard presses; this pattern-specific exception preserves native opening, focus, hover and background feedback without changing other buttons.

Unread titles use medium weight. Read titles use regular weight, and the entire row content (icon, title, message, timestamp and source) uses 50% opacity. Hover surfaces and keyboard focus indicators retain full opacity; read notifications remain actionable.

Applications follow this shared contract:

- Event records have stable `id`, workspace scope, `occurredAt` and `createdAt`, plus domain-specific type/payload. Map those records into `NotificationItem`; the UI package does not import a backend schema.
- Read receipts are scoped by workspace, authenticated user and event, with an immutable `readAt`. Store them durably so different browsers/devices share the same read state. One user's action must not acknowledge another user's feed.
- The feed includes every unread event regardless of age and read events whose `readAt` is within the preceding 24 hours. This is a presentation filter, not deletion of event, delivery or audit history. Retain receipts after rows age out so they cannot reappear unread.
- List responses contain `notifications` with nullable `readAt`, total `unreadCount` independent of page size, and nullable `nextCursor`. Use bounded cursor pages with stable timestamp/ID ordering, preserving database timestamp precision. Provide access to every eligible event, rather than permanently limiting the feed to the latest 20 or 50 rows.
- Mark-all is an idempotent server mutation scoped from the authenticated session. It marks the events visible to its database snapshot, leaves later arrivals unread and preserves existing receipt times on retries. It takes no caller-supplied user or workspace identity. It never deletes notifications.

Towbar implements these responsibilities in its notification-center API and receipt table. Consumers use their own database/API adapters and authorization rules. The shared `onMarkAllRead` callback requests persistence; `markingRead` blocks repeated presses. Supply the server's total unread count and `unread: readAt === null` for rows. Preserve committed rows on a failed refresh; failed mutations use one bottom-center toast.

`dialogRef` optionally receives the native `Popover.Dialog` element. Use it when an app-owned refresh or pagination action must move focus before disabling its initiating control. Capture whether that control actually held focus, focus the dialog before changing pending state, and restore the control only if the same dialog is still connected and still holds focus. A closed or reopened menu, a disconnected control, or a deliberate focus move elsewhere must cancel that restoration. Omit the ref when native popover focus handling is sufficient. Read/unread text can use the existing `NotificationItem.source`; only supply a status known from server data.

`onActivate` awaits an app-owned action, locks repeated ordinary clicks and keyboard activation, and reports a rejection through one toast while retaining the menu. Modified link clicks retain native navigation. Opening the menu never invokes activation. The app owns navigation and must ignore obsolete asynchronous results after its menu session or route changes; the shared menu likewise prevents an old completion from closing a reopened popover.

## Agent chat

`AgentChat` is the shared assistant panel: transcript, approvals for actions that change data, and the composer. Place it in `AppLayout`'s `aside` and put `AgentChatTrigger` in `ApplicationNavbar`'s `actions`. On desktop the panel docks beside the page so the page stays usable while client tools act on it. Below 64rem it opens as a full-width right drawer, and AppLayout closes the navigation drawer while it is open.

```tsx
const chat = useAgentChat({ endpoint: "/v1/agent", clientTools });
const [open, setOpen] = useState(false);

<AppLayout
  aside={
    <AgentChat
      productName="Vitalog"
      {...chat.state}
      onSend={chat.send}
      onDecide={chat.decide}
      onStop={chat.stop}
      onNewConversation={chat.reset}
      onClose={() => setOpen(false)}
      describeTool={describeVitalogTool}
    />
  }
  asideOpen={open}
  onAsideOpenChange={setOpen}
  navbar={
    <ApplicationNavbar
      actions={
        <AgentChatTrigger
          isOpen={open}
          onOpenChange={setOpen}
          needsAttention={chat.state.pending.length > 0}
        />
      }
    />
  }
/>;
```

The props mirror the state of `useAgentChat` from `@avgeek-oss/agent-react`; this package does not depend on it. Apps own the agent server, tool permissions and conversation storage.

- Give each tool a short action label through `describeTool`, for example "Log 30 g protein". Supply `detail` for approvals that need a consequence, such as a post publishing externally. Unnamed tools fall back to a readable form of the tool name.
- Approvals appear inline where the model asked for them. The server decides which tools need approval; the panel only presents them. The composer stays available, and a new message declines waiting actions.
- Assistant replies render a Markdown subset: paragraphs, headings, lists, quotes, fenced code, tables, emphasis, inline code and http(s) links. Raw HTML is never interpreted.
- `suggestions` seed an empty conversation. Keep them specific to the product's data.
- Supplying `conversations` adds the history view. `onDeleteConversation` confirms first and reports a failure with one toast.
- Failures use the `error` alert. Show `onRetry` only when the app can repeat the request.

## Notification settings

`NotificationDestinationsSettings` is the configuration surface for outgoing notifications; `NotificationMenu` displays incoming notifications. A destination supplies `id`, `label`, optional description/icon, and subscriptions keyed by category ID. Each category declares a label and allowed modes: `off`, `all`, or `failures`. Two-mode categories render checkboxes; failure-aware categories render All/Failures only choices and Clear when Off is allowed.

`onSubscriptionChange` receives the destination, category ID, and next mode. Update controlled items after persistence succeeds; failures retain the previous selection. Subscription controls are disabled during a request. Optional test and removal callbacks use consequence confirmations. Compose provider-specific setup content through toolbar/children slots.

`AddNotificationDestinationDialog` collects provider-specific fields supplied as `AuthField` definitions and awaits `onAdd`. The app normalizes and validates addresses, channel IDs, chat IDs, or webhook routes and checks destination limits/duplicates. Category definitions should describe the application's actual event types.

## Integrations and operations

`IntegrationConnectionCard` represents one provider connection. Pass provider identity, a nullable connection with status/details, connection actions, and accurate disconnect consequences. A disconnected card renders the connect state. Compose multiple cards for providers with multiple installations; OAuth redirects and callback validation stay in the app.

`OperationProgress` displays an ordered list of `OperationStep` records. Each step has an ID, title, description, and one of `waiting`, `running`, `succeeded`, `failed`, `skipped`, or `cancelled`. Details are supplied as children. `OperationProgress` expands failed steps with details initially; waiting steps cannot expand. Use `ProgressChecklistItem` inside an `Accordion` when custom surrounding composition is needed; set expansion state on the surrounding Accordion through its native `defaultExpandedKeys` or `expandedKeys` API. Optional step links use the shared router. The app maps operation events, formats timing, supplies logs, and handles polling/retries. This is background operation progress, not form-step navigation.

## Shared feedback and actions

`StatusIndicator` accepts a visible label, semantic Chip color, optional icon, and tooltip description. Apps map domain statuses into this `StatusDescriptor`; the library does not interpret strings such as `running` or `active`.

`AsyncActionButton` awaits an action, locks repeated presses, and reports failure through one danger toast. Shared form submissions, key creation, notification subscriptions, and confirmation actions use the same toast-only failure contract. Supply `confirmation` for a consequence dialog or use `ActionConfirmation` directly with controlled open state. Confirmation stays open on failure and cannot be dismissed during a request. Callbacks should reject on failure and resolve only when the operation succeeds; do not catch a failed request and return apparent success. Apps own cache refresh, permission checks, success navigation, and optional success feedback. Mount one bottom-center `Toast.Provider` for the application, including routes outside AppShell.

`QueryLoading` announces initial loading with a visually hidden `role="status"` by default, matching Towbar. It occupies no page layout space and remains in the accessibility tree. Supply descriptive children for the view being loaded. A deliberately visible progress message can opt in through `className="not-sr-only text-sm text-muted"`; use that only when visible progress helps the user, rather than for ordinary initial query loading. `QueryError` displays the supplied failure and optional retry callback. Keep stale data visible during background refresh instead of replacing it with initial loading.

`ChoiceField` renders a secondary-surface choice with labels, optional descriptions/icons, and selection-indicator spacing. Use it for role, permission, and expiry choices within patterns. Use native `Select` directly for other composition requirements.

## Authentication capabilities

`SignIn.isPending` disables the credential form, forgot-password action, and optional passkey action while an app-owned authentication request is running. Existing credential drafts remain intact. `PasskeyVerification` renders the passkey recovery fallback when `onRecoverySignIn` is supplied. `onAuthenticatorSignIn` is deprecated compatibility for older consumers; new integrations use passkeys only. Fallbacks and retry are disabled during the WebAuthn request; cancellation and back navigation remain available so the app can abort the ceremony.

Use `ConfirmIdentityDialog` with `method="custom"` and `children` for an app-owned multi-step password, passkey, or passkey recovery ceremony. The app owns field submission, pending state, retry, failure toasts, step-up verification, and mutation completion. `isPending` blocks dismissal by default. Set `isDismissDisabled={false}` only when dismissal aborts the pending request safely; the app must perform that cancellation in `onOpenChange`. The existing password/passkey modes retain their awaited callback behavior.

`McpAuthorization.isDisabled` blocks both decisions without representing a pending request. Use it after an uncertain or malformed decision acknowledgement when the app cannot safely replay a one-time grant. `approvalBlockedReason` remains the separate policy condition that blocks approval while permitting denial.

`PasskeySettings.onRename` and `onReplaceRecoveryCodes` are optional capabilities. Unsupported actions are omitted. Recovery replacement appears only when that callback is supplied and the passkey list is nonempty; applications whose recovery policy depends on another factor should compose their recovery action with that factor’s settings instead. To display newly generated codes, pass both `recoveryCodes` and `onDismissRecoveryCodes`; never reconstruct old codes from stored hashes. All callbacks resolve only after the server operation completes.

Use `ProfileSettings` with `email`, `value` and `onSave` for the common Profile details widget. It includes the Gravatar control and name form in one surface. `ProfileImageSettings` is the image control for composition inside an existing widget; do not add a separate Appearance widget.

Use `InvitationPasswordSetup` when a private invitation link establishes the invited identity and the server expects name/password registration. Use `AcceptInvitation` and `InvitationVerification` when the server requires email-code verification first. Do not display a verification method that the app does not implement.

Use `PasskeyRecoveryVerification` after the password has already passed and the server holds a pending passkey challenge. It collects only the recovery code. `RecoverySignIn` is for a server accepting credentials and recovery code together. Apps must bind recovery to the correct pending sign-in, consume the code exactly once and retain the password/passkey gate; these components do not establish authentication.

`ConfirmIdentityDialog` with `method="passkey"` shows the shared passkey description below its title and a **Use Passkey** action. It accepts optional `onCancelRequest`. When supplied, Cancel stays enabled during the ceremony, invokes cancellation, then requests dismissal. The app must abort WebAuthn before dismissal, handle deliberate cancellation without an error toast, and avoid supplying this callback during an irreversible mutation. Other pending confirmations remain protected from dismissal.

Use `RemoveMemberDialog` and `RevokeInvitationDialog` for the standard team confirmations. Apps enforce permissions and last-administrator protections, supply identity/email and await the real mutation. Rejection retains the dialog for retry with one toast. These surfaces describe access removal without promising deletion of historical work.

Use `TeamGeneralSettings` for general team identity. Supply the saved name and callback; set `mode="details"` only when the server supports a description. Apps retain name limits, permissions, persistence and identity refresh. Do not show unsupported fields.

Use `EmailConfirmation` for verifying an email address or confirming an email change from a link. `purpose` is `verify-email` or `email-change`; `status` is controlled by the application. The `ready` state requires `onConfirm`, `checking` shows progress, `confirmed` gives neutral sign-in instructions, and `unavailable` offers `onRetry` only when the application can safely retry. The screen never confirms on mount or parses a token. Applications validate the link and server acknowledgement, refresh or revoke session state as required, emit one success toast, and set `confirmed`. Rejected confirmation/retry callbacks produce one shared danger toast; those callbacks must not also toast the same error. Initial link-check failures remain app-owned toast feedback. Confirmation and Back remain unavailable while the awaited operation is pending.

`InvitationVerification.onResendCode` is optional. When provided, the resend action shares the verification request lock and preserves Name and code drafts on failure. Supply `resendAvailableAt` as a server-provided Unix timestamp in milliseconds to enforce the resend cooldown. The callback resolves only after the request succeeds; the shared action emits one success toast, or one danger toast on rejection. Do not also emit those outcomes in the callback. Applications own expiry, email delivery, limits and invitation tokens. Omit the callback when resending is unsupported.

## Expandable attribute lists

Import `ExpandableAttributeList` from the package root or `patterns/expandable-attribute-list`. The root accepts `title`, children, optional title `icon` and `footer`. Compose `ExpandableAttributeList.Item` with `label`, `value`, optional `leadingContent` (for example a formatted time), and a decorative `icon`. Detail content belongs in the item's children; omit children for static rows. Static rows have no disclosure control or chevron but preserve the value column's alignment.

The pattern owns the Attributes list frame, row padding, full-width separators between main entries, keyboard disclosure and detail alignment. Its trailing column reserves room for the 16px chevron and a 16px edge inset; static rows reserve the same space to keep values aligned. Details begin under the row label and end under the value, with 12px above and below the panel contents. Compose `Attributes variant="embedded"` inside a detail panel for label/value data; these detail rows have no dividers and use 8px between entries. Item expansion is independent by default; use native `isExpanded`, `defaultExpanded` and `onExpandedChange` for controlled or initial state. DOM attributes and refs are forwarded to the root and list item.

Apps supply domain labels, icons, formatted dates/values, pagination and empty/loading/error content. Use `Attributes variant="list"` directly when every row is a noninteractive attribute. Use `ResourceTable` for records requiring column headers, sorting or row actions; use `Accordion` for general sections that do not follow this attribute layout.

## Error pages

Use `ErrorPage` ([source](../src/patterns/feedback/error-page.tsx)) for a route that cannot render: `status="not-found"` for 404, `status="server-error"` for 500, `status="unavailable"` for connection or service outages, and `status="forbidden"` for access restrictions. Storybook previews these under `Patterns / Feedback / ErrorPage`. Import from the package root or `patterns/feedback/error-page`.

The pattern owns the centered layout, status icon, heading hierarchy, explanation and recovery controls. Apps supply `onRetry`, `isPending`, `returnHref` and `returnLabel`; optional children compose additional recovery actions. Retry is shown only when supplied. Apps retain routing, session policy, error classification and data fetching. Never pass raw exception details into user-facing copy. Keep actionable error-page explanations visible; mutation failures still use toasts. Use `QueryError` for a query failure within an otherwise usable page, and `EmptyState` for successful requests with no records.

## Backend recovery

Use `BackendUnavailable` from `patterns/feedback/backend-unavailable` when the backend cannot serve the initial session or application data. It shows a full-viewport neutral surface, an accent spinner and muted app-specific text. Keep known sessions and loaded content during background failures; do not redirect to sign-in because a request failed. Reserve `ErrorPage` for 404, 403 and application errors that need explicit recovery.

Apps own outage classification and recovery requests. Use `useBackendReconnect(enabled, reconnect)` for read-only probes every five seconds and on browser focus or reconnection. The callback receives an abort signal and returns true when recovery is complete; false or rejection keeps retrying. Requests do not overlap, time out after twenty seconds, and abort on unmount. Check the signal before applying a result. An existing app-owned retry loop can also drive this surface, as Towbar already does. Never automatically replay mutations.
