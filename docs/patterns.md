# Shared application patterns

Towbar is the baseline for common application surfaces. Use these exports directly so applications share their layout, interaction states, and presentation contracts. Components receive typed UI data and callbacks; applications adapt server responses, enforce permissions, perform requests, and update committed data.

Import components and their props from the package root or the subpath shown in the catalog. Every component has a separate interactive Storybook fixture. Empty states and simulated failures belong to those fixtures, not to production callbacks.

## Account settings

Sign-in is SSO only. The organisation's identity provider owns each person's name, email, picture and role, and grants access to each app; the app mirrors people through SCIM. There are no passwords, passkeys, recovery codes, invitations, email verification or email changes in the apps, and no in-app role editing. Roles are `viewer` < `member` < `admin`.

`ProfileSettings` is read-only: pass `name`, `email` and `providerName`, and optionally `role`, `avatarUrl` and `manageUrl` (the provider's own account page). It says where the profile is changed. `ProfileImageSettings` remains for apps that show the Gravatar link beside it.

`SessionsSettings` lists signed-in browsers and devices (`Session`: `id`, `name`, optional `detail` and `signedInAt`, nullable `lastActive`, `expiresAt`, `current`). The current row's Sign out calls the awaited `onSignOutCurrent`; other rows show Sign out, with a confirmation, only when `onSignOut(id)` is supplied, and **Sign out everywhere** appears only with `onSignOutEverywhere`. Omit callbacks the backend cannot honour.

`ApiKeysTable` displays the auth client's `ApiKey` (`id`, `name`, `ceiling`, nullable `workspace`, `createdAt`, nullable `expiresAt`, `lastUsedAt`, `replacedBy` and `graceUntil`), so a list from `@avgeek-oss/auth-client` can be passed as is. Columns are Name, Role (the ceiling), Workspace (only when a key has one; `workspaceLabel` names it), Added, Expires, Last used and Actions. A key acts with the lower of its ceiling and its owner's current role. Expires shows the date or No expiry, with an Expired label once it has passed; a rotated key shows Rotating with its grace end in Expires, then Replaced. It retains the table layout on mobile, with horizontal scrolling contained inside the table. `isApiKeyUsable(key)` says whether a key still works.

`ApiKeysSettings` adds a confirmed Revoke and, when `onRotate(id, graceSeconds)` is supplied, Rotate for usable keys that have not been rotated. Rotate opens `RotateApiKeyDialog`: the new key keeps the name, role and workspace, the old one works for the chosen grace period (`apiKeyGraceOptions`: now, 1 hour, 24 hours, 7 days; ids are seconds), and the new secret is shown once. Dismissal returns focus to the row action, including late native row/cell restoration.

`CreateApiKeyDialog` collects Name (1–100 characters), Role and Expires after, plus Workspace when `workspaces` is supplied (with an "All workspaces" choice). `ceilings` lists the roles the person may give a key, never above their own. Role and expiry start empty and need an explicit choice. `apiKeyExpiryOptions` ids are whole days or `never`; leave `never` out where keys must expire. `onCreate` receives `CreateApiKeyValues` (`name`, `ceiling`, `workspace`, `expiresInSeconds`), the auth client's `CreateApiKeyInput`, and resolves to `{ key }`, shown once with a copy action. Resolve to `undefined` when the app took over instead, such as by starting step-up; the dialog closes without a toast. Never put a secret in table records, persistent state, fixture logs or analytics.

`AuthorizedClientsTable` and `McpConnectionsSettings` show the auth client's `ConnectedApp` records: App (logo and name, with the client id), Role, Connected, Last used and Disconnect, plus a "Limited to" column when `formatRestrictions` describes app-defined restrictions such as a workspace. Codex clients display the Codex name and ChatGPT logo, including those identified by a ChatGPT Codex metadata URL; a registered `logoUri` is shown without a referrer. Client trust is supplied explicitly as `trust`; a name or logo does not establish it.

## Team settings

`PeopleDirectory` is a read-only directory mirrored from the provider: Person (avatar, name, email, and a Suspended, Deactivated or Deleted badge), Role, Source (where the role came from: Sign-in, SCIM or App) and Last sign-in. `DirectoryPerson` uses the auth client's words: `roleSource` is `claims`, `scim` or `app`, and `status` is `active`, `suspended` (no access until the provider assigns a role), `deactivated` or `deleted`. Without a `status`, a `null` role means suspended. It opens with "Access is managed in <provider>", linking `manageUrl` when supplied; pass `note` to replace it, or `null` to omit it. `currentUserId` adds "(you)". Optional `actions` adds a row action column, for example for an admin view of someone's keys through the client's `admin` API. Roles and app access are never changed here.

`WorkspaceMembersSettings` is for apps with workspaces, whose membership the app owns. It lists `members` with Remove (confirmed) and an **Add people** dialog that offers everyone in `people` who has a role, is active and is not yet a member. `ConnectedPeopleDirectory` does not edit membership: workspaces are app-defined, so the app loads its members and passes them here. Adding or removing someone never changes their role. Apps enforce who may change membership.

`TeamGeneralSettings` owns the Team details widget and Team name copy, and `teamRoleOptions` the Admin, Member and Viewer labels and descriptions used by the role pickers above.

## History and filters

Use `HistoryTable` when a resource list needs history pagination and loading/error/filter states. Use `ResourceTable` for a plain record list without those behaviors. History records only require an `id`; columns describe their actual fields, so audit events and delivery attempts need not share a backend payload. `HistoryPagination` accepts a one-based page and either a known total or previous/next availability. During refresh, existing rows remain visible and page changes are blocked. Retry is an app callback. Cursor encoding, fetching, polling, and filter serialization stay in the app.

`HistorySearch` submits a trimmed search and resets it immediately when cleared. Pass the applied search, such as one read from the URL, as `value`; the field shows it and replaces an unsubmitted draft when it changes. `HistoryFilter` selects one option with optional search, icons, and trailing metadata. Its search field has an 8px popover inset. Supplied avatars retain their size in both menu rows and selected values; ordinary SVG icons and bare `<img>` logos in the selected value use 16px. The search field uses 16px text on small screens so iOS does not zoom when it is focused. The empty string represents All; option IDs must not use the reserved `all` ID. Both controls compose above `HistoryTable`.

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

`OperationProgress` displays an ordered list of `OperationStep` records. Each step has an ID, title, description, and one of `waiting`, `running`, `succeeded`, `failed`, `skipped`, or `cancelled`. Details are supplied as children. `OperationProgress` expands failed steps with details initially; waiting steps cannot expand. Use `ProgressChecklistItem` inside an `Accordion` when custom surrounding composition is needed. A failed item with details expands on its own, including when it fails after rendering, until the user toggles it; pass `defaultExpanded` to start expanded or `defaultExpanded={false}` to opt out. Other expansion state belongs to the surrounding Accordion's native `defaultExpandedKeys` or `expandedKeys` API. Optional step links use the shared router. The app maps operation events, formats timing, supplies logs, and handles polling/retries. This is background operation progress, not form-step navigation.

## Shared feedback and actions

`StatusIndicator` accepts a visible label, semantic Chip color, optional icon, and tooltip description. Apps map domain statuses into this `StatusDescriptor`; the library does not interpret strings such as `running` or `active`.

`AsyncActionButton` awaits an action, locks repeated presses, and reports failure through one danger toast. Shared form submissions, key creation, notification subscriptions, and confirmation actions use the same toast-only failure contract. Supply `confirmation` for a consequence dialog or use `ActionConfirmation` directly with controlled open state. Confirmation stays open on failure and cannot be dismissed during a request. Callbacks should reject on failure and resolve only when the operation succeeds; do not catch a failed request and return apparent success. Apps own cache refresh, permission checks, success navigation, and optional success feedback. Mount one bottom-center `Toast.Provider` for the application, including routes outside AppShell.

`QueryLoading` announces initial loading with a visually hidden `role="status"` by default, matching Towbar. It occupies no page layout space and remains in the accessibility tree. Supply descriptive children for the view being loaded. A deliberately visible progress message can opt in through `className="not-sr-only text-sm text-muted"`; use that only when visible progress helps the user, rather than for ordinary initial query loading. `QueryError` displays the supplied failure and optional retry callback. Keep stale data visible during background refresh instead of replacing it with initial loading.

`ChoiceField` renders a secondary-surface choice with labels, optional descriptions/icons, and selection-indicator spacing. Use it for role, permission, and expiry choices within patterns, and for app pickers such as assignees or providers. Options may add trailing `endContent` text, such as a count, and `muted` for a choice like Unassigned; `icon` holds leading content, including avatars. Set `search` for long lists, `hideLabel` where surrounding text already names the field, and `description` for help text below it. The search filters on each option's label, description and end content, which also form its accessible name. Use native `Select` directly for other composition requirements.

`TextField` (`patterns/text-field`) is a labelled native input, or a textarea with `multiline`, on the secondary surface. Native input props such as `value`, `onChange`, `required` and `maxLength` pass through; `description` renders help text linked through `aria-describedby`. Use `AuthForm` for submitted field sets and `TextField` for individual fields in app forms and dialogs.

`DatePickerField` (`patterns/date-picker-field`) is a labelled calendar date with a calendar popover. Its value is a `YYYY-MM-DD` string or null; the clear button sets null and returns focus to the calendar button. Use `DateTimeRangePicker` for ranges with times and `DatePicker` for custom composition.

`RelativeTime` (`data-display/relative-time`) shows a timestamp relative to now with the absolute time available. `display="stacked"` (default) puts relative text over the absolute time, as in table cells; `relative` shows "label relative", for example "Last synced 5 minutes ago"; `compact` shows only the relative text with the absolute time in its tooltip; `absolute` shows only the absolute time. Apps pass `formatAbsolute` with the viewer's date and time preferences and the matching `timeZone`; relative text comes from `Intl.RelativeTimeFormat`. Mounted instances share one clock that refreshes every 30 seconds while the page is visible, and render no relative text during server rendering and hydration. `formatRelativeTime(value, now)` and `useCurrentTime()` serve other relative labels.

## Authentication

`SignIn` is one screen with **Continue with <provider>**. `onContinue` starts sign-in; the app navigates to the client's `signInUrl(returnTo)`, keeping the page the person came from. Pass the callback's redirect error (`readAuthRedirectError(location.href)`) as `error` to show why the last attempt failed, then remove it from the URL with `withoutAuthRedirectError`. `authRedirectErrorMessage(error, { productName, providerName })` turns every documented code and reason into a message that is safe to show, and a general one for codes it does not know. The button locks after the first press until the page is left, or restored from the browser's history cache.

`AccessDenied` covers people who cannot use the app: `unassigned` ("You don't have access to <app>. Ask an admin to assign it to you in <provider>."), `suspended` (known to the app, no role) and `inactive` (deactivated or removed in the provider). `accessDeniedStatus(error)` maps a `sign_in_denied` redirect error to the status. `onTryAgain` restarts sign-in, for after an admin has assigned access. Never offer a way to request or grant access in the app.

`StepUpDialog` is for an action that failed with `step_up_required`. It explains why (`reason`), and one button sends the person back through the provider (`prompt=login` with MFA) with the current page as `returnTo`. The app records the action and repeats it when they return; the connected containers do this for admin keys and admin consent.

`McpAuthorization` presents a loaded consent request: the client (name, logo from `logo` or `logoUri`, through the MCP client presentation), **Returns to** with the redirect host, a warning when the redirect is to this computer (`localhost`), **Access to** with the resources, and the role ceiling. `ceilings` lists the roles the person may choose, which never exceed their own; others are shown disabled, and an unavailable ceiling blocks approval while permitting denial. `workspace` adds a required workspace picker for apps whose grants can be scoped; the app turns the choice into restrictions its `validateRestrictions` hook accepts. `isDisabled` blocks both decisions without a pending state, after an uncertain answer to a decision that must not be sent twice. `approvalBlockedReason` is a separate policy notice. Failures passed as `error` show one toast.

`TeamSetup` is first-run onboarding for an admin: the team name, then date and time preferences, in one awaited `onSubmit`. The admin's identity comes from the provider; gate the page on the admin role.

### Connected containers

`@avgeek-oss/design-system/patterns/auth/connected` exports containers that take an `AuthClient` from `@avgeek-oss/auth-client` and do the data work: `ConnectedSignIn`, `ConnectedMcpConsent`, `ConnectedAccountSettings`, `ConnectedApiKeysSettings`, `ConnectedMcpConnections` and `ConnectedPeopleDirectory`. The client is an optional peer (`^0.2.0`) used for types only: apps that do not import this subpath do not need it, and nothing in the package imports it at runtime. Each container takes `client` and an optional `navigate` (default `location.assign`; pass a router's for client-side routes).

- `ConnectedSignIn` reads `?auth_error=`, shows access denials on `AccessDenied` and other failures on `SignIn`, removes the error from the URL, and starts sign-in back to `returnTo` (default: the page's `?returnTo=` when it is a path on this origin, otherwise `/`).
- `ConnectedMcpConsent` signs a signed-out visitor in first and comes back, loads the request from `?request=` (or `requestId`), and sends the decision with the chosen ceiling and, with `workspaces`, restrictions. An admin ceiling needs a recent sign-in: it steps up and approves when the person returns. An expired or used request has its own screen. When the answer to a decision is lost, both decisions are disabled and the person starts again from the client.
- `ConnectedAccountSettings` shows the profile from the session and the person's sessions from `client.sessions.list()`: each named by browser and operating system (such as "Firefox on macOS"), with This device on the current one, Signed in, Last active and Expires (the earlier of the idle and absolute expiry). Sign out on another row revokes it after a confirmation, removing it at once and restoring it if the request fails; one that already ended is dropped. Sign out on this browser's row and **Sign out everywhere** end this page's session too, so they go on to the provider's logout URL, or `signedOutUrl` when there is none.
- `ConnectedApiKeysSettings` lists keys and creates, rotates and revokes them, offering ceilings up to the person's role. Creating or rotating an admin key steps up first and finishes, with the secret, when the person returns. Revocation removes the row at once and restores it if the request fails.
- `ConnectedMcpConnections` lists connected apps and disconnects them the same way.
- `ConnectedPeopleDirectory` is for admins: it pages through `client.admin.users.list()` into `PeopleDirectory`, with a search on name and email that waits for typing to pause, a status filter (Everyone, Active, Suspended, Deactivated, Deleted) and previous/next pages by cursor (`pageSize`, default 50). A new search or filter starts again from the first page, and rows stay on screen while the next ones load. Someone who is not an admin is told the directory is for admins, without a retry. Optional `actions(user)` adds a row action column. It never changes roles, access or workspace membership.

Load failures show the error with a retry, never an empty list; change failures show one toast. A step-up is repeated only on the page that started it, within ten minutes, and never after a failed step-up. auth-core does not ask for a recent sign-in to sign out sessions or read the directory, so those containers do not step up, like disconnecting an app: a failure there is one toast or the load error.

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
