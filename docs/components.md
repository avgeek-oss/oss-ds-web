# Component catalog

Storybook follows three layers:

- **Primitives:** one fixture per component file, showing its variants, states and compound parts with neutral content. Fixtures import the component directly from `src`; they do not reimplement its styling or contain application workflows.
- **Patterns:** published authentication, account settings, team settings and data components. Fixtures supply sample data and simulate app callbacks; composed examples without a matching library export are omitted.
- **Layouts:** shell, sidebars, page headings and navigation.

Storybook mirrors the component folders: `src/forms/checkbox.tsx` appears at `Primitives / Forms / Checkbox`, and `src/data-display/chip.tsx` at `Primitives / DataDisplay / Chip`. HeroUI-backed primitives follow native styling and variant APIs; composed helpers retain their behavior without restyling the base component. `UserAvatar` belongs to Patterns, where it supplies initials and Gravatar lookup. `ResourceTable` appears under Patterns and composes the Table primitive with record links, actions and an empty state. Its source is [src/patterns/resource-table.tsx](../src/patterns/resource-table.tsx). Source-file mapping is listed below. Applications use that component export directly; fixture wrappers are only for the studio and are not published.

`WorkspaceSelector` is the shared workspace picker in [src/navigation/workspace-selector.tsx](../src/navigation/workspace-selector.tsx), previewed under `Layouts / WorkspaceSelector`. Import it from the package root or `navigation/workspace-selector`, and pass it through `SidebarConfig.workspace`. It owns the section label, native button-shaped trigger with a trailing dropdown indicator, text-only choices, and optional Create Workspace action with a plus icon. Apps supply `items`, `selectedKey`, `onSelectionChange`, optional `onCreate`, and `isDisabled`; they own requests, permissions and dialogs.

`NotificationMenu` is the shared notification trigger and popover in [src/patterns/notifications.tsx](../src/patterns/notifications.tsx), previewed under `Patterns / NotificationMenu`. Import it from the package root or `@avgeek-oss/design-system/patterns/notifications`. Apps supply notification items and mutations; the component owns presentation, navigation dismissal, and controlled or uncontrolled open state.

Use optional `onActivate(item)` when ordinary notification navigation must await an app mutation. The callback owns the read request and navigation: await the real backend result, then navigate. The menu prevents default ordinary navigation, locks duplicate requests immediately, announces the pending row, and closes only after callback success. Rejection shows one danger toast and retains the menu for retry; throw the meaningful failure instead of also displaying it in the callback. A settled callback does not close a later popover session. Opening the menu never invokes the callback. Modified and new-tab clicks stay native links and bypass mutation; without `onActivate`, ordinary links retain `RouteLink` navigation.

`emptyContent` replaces the default empty area, for example an app-owned retry control after an initial query failure. `footer` composes pagination or retry controls below existing records; use `Widget.Action` for inline footer actions. Apps own query feedback, retry state, loading, pagination, read state, and retention. Keep loaded records when a page request fails and report failures with a toast; do not pass an empty array to disguise a failed fetch as a successful empty result. `headerEnd` remains available for custom header actions. The default read-all caption is “Mark all as read”.

`TeamSetup` is the two-step first-run pattern in [src/patterns/auth/team-setup.tsx](../src/patterns/auth/team-setup.tsx), previewed under `Patterns / Auth / TeamSetup`. Import it from the package root or `@avgeek-oss/design-system/patterns/auth/team-setup`. It collects the team name and the admin's date and time preferences; the admin's identity comes from the identity provider.

`McpAuthorization` is the shared MCP consent screen. Supply `brand`, `productName`, `client` (`name`, `redirectHost`, `localhost`, optional `id`, `logo` and `logoUri`), optional `resources`, a controlled `ceiling` with `ceilings` (the roles the person may choose) and `onCeilingChange`, an optional `workspace` picker, `onApprove` and `onDeny`. The screen owns the Application, Returns to and Access to fields, the localhost warning, the Role picker, role guidance, Deny/Approve and the Back to client action. Returning invokes `onDeny` so the app can complete a validated OAuth denial. Pending or disabled state blocks decisions and navigation; a ceiling outside `ceilings` blocks approval while permitting denial. Mutation errors use toasts.

Authentication screens are published components. Storybook uses a separate fixture file for each under `Patterns / Auth`, matching `src/patterns/auth`. Screens accept a brand and app callbacks; fixtures only simulate requests and navigation. Import a screen from the package root or its `patterns/auth/<file>` subpath. Sign-in is SSO only.

| Component      | Source                                                                          | App callbacks and data                                                                                                    |
| -------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `SignIn`       | [src/patterns/auth/sign-in.tsx](../src/patterns/auth/sign-in.tsx)               | Product and provider names, `onContinue` to start sign-in, the redirect `error`, pending state.                           |
| `AccessDenied` | [src/patterns/auth/access-denied.tsx](../src/patterns/auth/access-denied.tsx)   | Product and provider names, `status` (unassigned, suspended, inactive), optional email and `onTryAgain`.                  |
| `StepUpDialog` | [src/patterns/auth/step-up-dialog.tsx](../src/patterns/auth/step-up-dialog.tsx) | Controlled open state, provider name, the reason and `onContinue` to start step-up. The app repeats the action on return. |

`patterns/auth/connected` ([source](../src/patterns/auth/connected.ts)) holds `ConnectedSignIn`, `ConnectedMcpConsent`, `ConnectedAccountSettings`, `ConnectedApiKeysSettings`, `ConnectedMcpConnections` and `ConnectedPeopleDirectory`, which take an `AuthClient` from the optional peer `@avgeek-oss/auth-client` (`^0.2.0`) and do the loading, errors, step-up and optimistic updates. They are previewed under `Patterns / Auth / Connected` against an in-memory fake client. They are not on the package root. See [connected containers](patterns.md#connected-containers).

Account settings live under `Patterns / Account Settings`, matching `src/patterns/account-settings`. Import them from the package root or `patterns/account-settings/<file>`. Apps own saved data and API calls; the components supply tables, dialogs and pending/error feedback.

| Component             | Source                                                                                | App callbacks and data                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `ProfileSettings`     | [profile-settings.tsx](../src/patterns/account-settings/profile-settings.tsx)         | Read-only name, email, role and provider name, with an optional link to the provider's account page.    |
| `PreferencesSettings` | [preferences-settings.tsx](../src/patterns/account-settings/preferences-settings.tsx) | Saved preferences, format/time-zone options and save callback.                                          |
| `SessionsSettings`    | [sessions-settings.tsx](../src/patterns/account-settings/sessions-settings.tsx)       | Sessions, date formatter, sign out of this browser, and optional sign out of one session or everywhere. |
| `ApiKeysSettings`     | [api-keys-settings.tsx](../src/patterns/account-settings/api-keys-settings.tsx)       | API keys with role ceilings, date formatter, workspace labels, revoke and optional rotate callbacks.    |

Team settings live under `Patterns / Team Settings`, matching `src/patterns/team-settings`. `PeopleDirectory` ([source](../src/patterns/team-settings/people-directory.tsx)) is the read-only directory mirrored from the identity provider, also exported through `patterns/settings/tables`. `WorkspaceMembersSettings` ([source](../src/patterns/team-settings/workspace-members-settings.tsx)) edits workspace membership for apps with workspaces.

The additional shared application patterns follow Towbar's common surfaces. Their typed data contracts, callback behavior, and boundaries are documented in [Shared application patterns](patterns.md). Each has its own fixture under the matching Patterns folder and is exported from the package root and the subpath below.

| Components                               | Public subpath                                                       |
| ---------------------------------------- | -------------------------------------------------------------------- |
| `ApiKeysTable`, `AuthorizedClientsTable` | `patterns/account-settings/api-keys-table`                           |
| `CreateApiKeyDialog`                     | `patterns/account-settings/create-api-key-dialog`                    |
| `RotateApiKeyDialog`                     | `patterns/account-settings/rotate-api-key-dialog`                    |
| `HistoryTable`                           | `patterns/history/history-table`                                     |
| `HistorySearch`                          | `patterns/history/history-search`                                    |
| `HistoryFilter`                          | `patterns/history/history-filter`                                    |
| `EventDetailsDialog`, `EventDetail`      | `patterns/history/event-details-dialog`                              |
| `FilterDialog`                           | `patterns/filters/filter-dialog`                                     |
| `NotificationDestinationsSettings`       | `patterns/notification-settings/notification-destinations-settings`  |
| `AddNotificationDestinationDialog`       | `patterns/notification-settings/add-notification-destination-dialog` |
| `IntegrationConnectionCard`              | `patterns/integrations/integration-connection-card`                  |
| `OperationProgress`                      | `patterns/operations/operation-progress`                             |
| `ProgressChecklistItem`                  | `patterns/operations/progress-checklist-item`                        |
| `StatusIndicator`                        | `patterns/status-indicator`                                          |
| `AsyncActionButton`                      | `patterns/actions/async-action-button`                               |
| `ActionConfirmation`                     | `patterns/actions/action-confirmation`                               |
| `QueryLoading`, `QueryError`             | `patterns/feedback/query-state`                                      |
| `ChoiceField`                            | `patterns/choice-field`                                              |
| `DatePickerField`                        | `patterns/date-picker-field`                                         |
| `AgentChat`                              | `patterns/agent-chat/agent-chat`                                     |
| `AgentChatTrigger`                       | `patterns/agent-chat/agent-chat-trigger`                             |

| Storybook primitive                       | Source file                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------------- |
| Accordion                                 | [src/data-display/accordion.tsx](../src/data-display/accordion.tsx)                   |
| Alert                                     | [src/feedback/alert.tsx](../src/feedback/alert.tsx)                                   |
| AlertDialog                               | [src/overlays/alert-dialog.tsx](../src/overlays/alert-dialog.tsx)                     |
| Attributes                                | [src/data-display/attributes.tsx](../src/data-display/attributes.tsx)                 |
| Autocomplete                              | [src/pickers/autocomplete.tsx](../src/pickers/autocomplete.tsx)                       |
| Avatar                                    | [src/data-display/avatar.tsx](../src/data-display/avatar.tsx)                         |
| BrandLockup                               | [src/media/brand-lockup.tsx](../src/media/brand-lockup.tsx)                           |
| Breadcrumbs                               | [src/navigation/breadcrumbs.tsx](../src/navigation/breadcrumbs.tsx)                   |
| Button                                    | [src/buttons/button.tsx](../src/buttons/button.tsx)                                   |
| Primitives / Charts / ChartRangeSelection | [src/charts/chart-range-selection.tsx](../src/charts/chart-range-selection.tsx)       |
| Calendar                                  | [src/pickers/calendar.tsx](../src/pickers/calendar.tsx)                               |
| DateField                                 | [src/forms/date-field.tsx](../src/forms/date-field.tsx)                               |
| DatePicker                                | [src/pickers/date-picker.tsx](../src/pickers/date-picker.tsx)                         |
| DateRangePicker                           | [src/pickers/date-range-picker.tsx](../src/pickers/date-range-picker.tsx)             |
| RangeCalendar                             | [src/pickers/range-calendar.tsx](../src/pickers/range-calendar.tsx)                   |
| RelativeTime                              | [src/data-display/relative-time.tsx](../src/data-display/relative-time.tsx)           |
| TimeField                                 | [src/forms/time-field.tsx](../src/forms/time-field.tsx)                               |
| DateTimeRangePicker                       | [src/patterns/date-time-range-picker.tsx](../src/patterns/date-time-range-picker.tsx) |
| Checkbox                                  | [src/forms/checkbox.tsx](../src/forms/checkbox.tsx)                                   |
| Chip                                      | [src/data-display/chip.tsx](../src/data-display/chip.tsx)                             |
| CodeBlock                                 | [src/typography/code-block.tsx](../src/typography/code-block.tsx)                     |
| ComboBox                                  | [src/pickers/combo-box.tsx](../src/pickers/combo-box.tsx)                             |
| Description                               | [src/forms/description.tsx](../src/forms/description.tsx)                             |
| Disclosure                                | [src/navigation/disclosure.tsx](../src/navigation/disclosure.tsx)                     |
| Dialog                                    | [src/overlays/dialog.tsx](../src/overlays/dialog.tsx)                                 |
| Drawer                                    | [src/overlays/drawer.tsx](../src/overlays/drawer.tsx)                                 |
| Dropdown                                  | [src/overlays/dropdown.tsx](../src/overlays/dropdown.tsx)                             |
| EmptyState                                | [src/data-display/empty-state.tsx](../src/data-display/empty-state.tsx)               |
| Field                                     | [src/forms/field.tsx](../src/forms/field.tsx)                                         |
| HeadingHelp                               | [src/overlays/heading-help.tsx](../src/overlays/heading-help.tsx)                     |
| InlineExternalLink                        | [src/navigation/inline-external-link.tsx](../src/navigation/inline-external-link.tsx) |
| Input                                     | [src/forms/input.tsx](../src/forms/input.tsx)                                         |
| InputGroup                                | [src/forms/input-group.tsx](../src/forms/input-group.tsx)                             |
| Label                                     | [src/forms/label.tsx](../src/forms/label.tsx)                                         |
| LineChart                                 | [src/charts/line-chart.tsx](../src/charts/line-chart.tsx)                             |
| ListBox                                   | [src/collections/list-box.tsx](../src/collections/list-box.tsx)                       |
| ListView                                  | [src/data-display/list-view.tsx](../src/data-display/list-view.tsx)                   |
| Modal                                     | [src/overlays/modal.tsx](../src/overlays/modal.tsx)                                   |
| Pagination                                | [src/navigation/pagination.tsx](../src/navigation/pagination.tsx)                     |
| PasswordInput                             | [src/forms/password-input.tsx](../src/forms/password-input.tsx)                       |
| Popover                                   | [src/overlays/popover.tsx](../src/overlays/popover.tsx)                               |
| ProgressCircle                            | [src/feedback/progress-circle.tsx](../src/feedback/progress-circle.tsx)               |
| RouteLink                                 | [src/navigation/route-link.tsx](../src/navigation/route-link.tsx)                     |
| ScrollShadow                              | [src/utilities/scroll-shadow.tsx](../src/utilities/scroll-shadow.tsx)                 |
| Select                                    | [src/forms/select.tsx](../src/forms/select.tsx)                                       |
| Skeleton                                  | [src/feedback/skeleton.tsx](../src/feedback/skeleton.tsx)                             |
| Spinner                                   | [src/feedback/spinner.tsx](../src/feedback/spinner.tsx)                               |
| Switch                                    | [src/forms/switch.tsx](../src/forms/switch.tsx)                                       |
| Table                                     | [src/data-display/table.tsx](../src/data-display/table.tsx)                           |
| TableCellText                             | [src/data-display/table-cell-text.tsx](../src/data-display/table-cell-text.tsx)       |
| Tabs                                      | [src/navigation/tabs.tsx](../src/navigation/tabs.tsx)                                 |
| Textarea                                  | [src/forms/textarea.tsx](../src/forms/textarea.tsx)                                   |
| ThemeSwitcher                             | [src/controls/theme-switcher.tsx](../src/controls/theme-switcher.tsx)                 |
| Toast                                     | [src/overlays/toast.tsx](../src/overlays/toast.tsx)                                   |
| ToggleButton                              | [src/buttons/toggle-button.tsx](../src/buttons/toggle-button.tsx)                     |
| Tooltip                                   | [src/overlays/tooltip.tsx](../src/overlays/tooltip.tsx)                               |
| Typography                                | [src/typography/typography.tsx](../src/typography/typography.tsx)                     |
| Widget                                    | [src/data-display/widget.tsx](../src/data-display/widget.tsx)                         |

Additional shared account surface:

| Component              | Source                                                                              | Responsibility                                                              |
| ---------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `ProfileImageSettings` | [ProfileImageSettings](../src/patterns/account-settings/profile-image-settings.tsx) | Gravatar image control inside Profile details, with account email and name. |

`TeamGeneralSettings` ([source](../src/patterns/team-settings/team-general-settings.tsx)) owns the Team details widget and Team name copy. The default mode saves a name; `mode="details"` saves name and description together for apps that support a team description.

`TextField` (`patterns/text-field`) and `Dialog` (`overlays/dialog`) are exported from their subpaths only. Their sources are [src/patterns/text-field.tsx](../src/patterns/text-field.tsx) and [src/overlays/dialog.tsx](../src/overlays/dialog.tsx), previewed under `Patterns / TextField` and `Primitives / Overlays / Dialog`. See [shared application patterns](patterns.md) and [modals](layouts.md#modals).

The package root also re-exports React Aria's `RouterProvider` and `UNSAFE_PortalProvider` (as `PortalProvider`) and the list `Header`, so apps that need them for client routing or portal containers do not depend on React Aria directly. Prefer `RouteProvider` for app navigation.

`OverlaySuspensionScope` and `useOverlaySuspension` are exported from the package root and `overlays/overlay-suspension`. Their source is [src/overlays/overlay-suspension.tsx](../src/overlays/overlay-suspension.tsx), with the retained modal and settings previews under `Primitives / Overlays / OverlaySuspensionScope`. Use the scope to release supported native overlay locks while preserving a mounted owner’s logical state. Use ordinary controlled `isOpen` for intentional dismissal. See [Suspending retained overlays](layouts.md#suspending-retained-overlays) for cancellation, drafts, supported portals and owner-change responsibilities.

### Date/time preference catalog

The React-free `utilities/date-time-preferences` public subpath and root export provide `dateFormatOptions`, `timeFormatOptions`, `defaultDateTimePreferences`, `DateFormatId`, `TimeFormatId` and `StandardDateTimePreferences`, plus `isTimeZone(value)` and `availableTimeZones()` (UTC first, then the runtime's IANA zones) for validating and listing time-zone preferences. API packages can import the subpath; keep request schemas in the app. Use this catalog for common preference controls instead of local option lists. See [forms](forms.md#display-preferences) for defaults, persistence and serialization boundaries.

### Common settings presentation

`SettingsPageTitle` (`patterns/settings/page-title`) supplies the standard common settings title and decorative 19px icon inside an application page heading, matching secondary sidebar entity headings. `settingsPageLabels` supplies matching navigation labels. Use the `mcp-connections` section below API Keys; keep MCP Guide separate. Both MCP pages and their navigation items use `McpServerIcon`.

`teamRoleOptions` (`patterns/team-settings/team-role-options`) supplies Admin, Member and Viewer with 16px icons and short generic descriptions for role ceiling pickers and role labels. Roles themselves are assigned in the identity provider; applications retain their permission enforcement.

`McpGuideSettings` (`patterns/account-settings/mcp-guide-settings`) owns the client selector, configuration code and MCP setup and troubleshooting link. The selector is compact on desktop and full width on mobile; configuration code retains the widget width. Pass app-owned `configurations` and `documentationUrl`; configuration entries contain `id`, `label`, optional `icon`, `filename` and `code`. `mcpClientConfigurations({ serverName, url })` (`utilities/mcp-client-presentation`) returns the standard Codex, Claude Code, Cursor, VS Code and Other clients entries for an app's server name and MCP URL, each with its `McpClientLogo`. Use `McpClientLogo` with the same client IDs elsewhere; unknown IDs show the generic MCP icon. Keep additional connection prose in the documentation.

`McpConnectionsSettings` (`patterns/account-settings/mcp-connections-settings`) shows authorized MCP clients on their own account page. Pass `AuthorizedClient` items (the auth client's `ConnectedApp` records), `formatDate`, optional `formatRestrictions` and an awaited `onRevoke(id)`. A failed revocation keeps its confirmation available; refresh committed items after success. API Keys is for manually created keys.

## Expandable attribute lists

`ExpandableAttributeList` ([source](../src/patterns/expandable-attribute-list.tsx)) is previewed under `Patterns / ExpandableAttributeList`. It shares the Attributes list frame, row spacing and full-width dividers. Use `Attributes variant="list"` directly for noninteractive label/value lists, such as weigh-ins. Use the expandable pattern for mixed activity lists where only some rows have details. See [pattern usage](patterns.md#expandable-attribute-lists).

## Emails and loading patterns

See [emails and loading](emails-and-loading.md) for usage and ownership rules.

| Export                              | Source                                                                                      | Storybook                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| AuthEmail                           | [src/emails/auth-email.tsx](../src/emails/auth-email.tsx)                                   | Patterns / Emails / AuthEmail          |
| EmailShell                          | [src/emails/email-shell.tsx](../src/emails/email-shell.tsx)                                 | Patterns / Emails / EmailShell         |
| renderAuthEmail, renderEmailMessage | [src/emails/render.tsx](../src/emails/render.tsx)                                           | Server renderer for the same templates |
| LoadingSkeleton, SkeletonCard       | [src/patterns/feedback/loading-skeleton.tsx](../src/patterns/feedback/loading-skeleton.tsx) | Patterns / Feedback / LoadingSkeleton  |

## Error pages

Use `ErrorPage` ([source](../src/patterns/feedback/error-page.tsx)) for a route that cannot render: `status="not-found"` for 404, `status="server-error"` for 500, `status="unavailable"` for connection or service outages, and `status="forbidden"` for access restrictions. Storybook previews these under `Patterns / Feedback / ErrorPage`. Import from the package root or `patterns/feedback/error-page`.

The pattern owns the centered layout, status icon, heading hierarchy, explanation and recovery controls. Apps supply `onRetry`, `isPending`, `returnHref` and `returnLabel`; optional children compose additional recovery actions. Retry is shown only when supplied. Apps retain routing, session policy, error classification and data fetching. Never pass raw exception details into user-facing copy. Keep actionable error-page explanations visible; mutation failures still use toasts. Use `QueryError` for a query failure within an otherwise usable page, and `EmptyState` for successful requests with no records.

`BackendUnavailable` and `useBackendReconnect` ([source](../src/patterns/feedback/backend-unavailable.tsx)) present temporary backend outages with automatic read-only recovery. Storybook previews the screen under Patterns / Feedback / BackendUnavailable.

`FileUpload` is the attachment upload pattern in [src/patterns/file-upload.tsx](../src/patterns/file-upload.tsx), previewed under `Patterns / FileUpload`. Import it and `FileUploadProps` from the package root or `@avgeek-oss/design-system/patterns/file-upload`. It accepts one image/PDF by default, supports file-picker and drag/drop input plus a mount-only `initialFile` supplied by an app-owned page drop, validates the configured types and size, and awaits an app-owned `onUpload(file)` callback. It owns pending, failure/retry and toast feedback; applications own storage, authorization and server validation. See [file uploads](forms.md#file-uploads).
