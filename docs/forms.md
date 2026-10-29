# Forms and feedback

## Input surfaces

Use `Input`, `PasswordInput`, `Textarea`, `Select`, and `InputGroup`. Searchable selection uses `Autocomplete` with `SearchField`; an ordinary choice uses `Select`.

For dates, compose HeroUI `DatePicker`, `DateField.Group` and `Calendar`. Use `DateField` alone for segmented entry without a popover, or `Calendar` for an inline calendar. Date values use `@internationalized/date`; persist a date-only value as an ISO date string. Apply the input surface variant to `DateField.Group`.

Use `DateTimeRangePicker` from `patterns/date-time-range-picker` for a date and time interval. It combines the exported `DateRangePicker`, `RangeCalendar`, `DateField` and `TimeField` primitives. Pass controlled `CalendarDateTime` values and `onChange`, a `label`, the appropriate surface `variant`, and optional `minValue`/`maxValue`. The calendar popover includes separate start/end time controls. The segmented inputs stack at mobile widths. `hourCycle`, `granularity` (`minute` or `second`), and `locale` control display without changing the stored date values. Apps own the saved time zone, resolving ambiguous daylight-saving times, UTC serialization, retention limits and persistence.

Variants for these examples are `primary` and `secondary`. `primary` is the primitive default.

- Base page or auth page → `primary`.
- Widget content → `secondary`.
- Modal or drawer content → `secondary`.

```tsx
<Widget.Content>
  <Input variant="secondary" />
</Widget.Content>
```

These are pattern choices; the base primitives retain HeroUI defaults. Each control has its own variant fixture under `Primitives`. Storybook patterns preview published components; composed form examples without a matching export are omitted.

Associate labels with controls and descriptions with `aria-describedby`. Keep one focus ring. Selection displays and menu options use `text-sm` (14px) at every breakpoint, including `Select` and `Autocomplete` values. Actual text-entry controls, including `Input`, `Textarea`, `SearchField` and the editable `ComboBox` input, retain HeroUI’s mobile `text-base` (16px) to prevent focus zoom, with `text-sm` from the `sm` breakpoint. Keep native control heights. Preserve long selected values with truncation and keep supplementary offsets in a separate right-aligned slot.

Selectable `ListBox.Item` rows reserve 32px at the inline end for the tick and its gap, including inside picker popovers. Compose a shrinking content wrapper with `min-w-0 flex-1`, truncate the label, and keep trailing metadata `shrink-0`. Do not position metadata over the selection indicator.

`Select`, `ComboBox`, and `Autocomplete` popovers use `--field-radius` plus an 8px inset, making their outer corners slightly rounder than the controls and nested search fields. Keep this shared picker radius instead of adding rounded classes to app popovers. Action menus and standalone contextual popovers retain their own surface treatment.

## Buttons

Use `Button` for actions and `ButtonLink` for navigation. `Button` exposes HeroUI’s native `sm`, `md` and `lg` sizes; the default is `md`.

Choose by purpose:

- Main submit or page action → default primary.
- Destructive operation → `danger` for solid danger, or `danger-soft` for the native soft treatment.
- Cancel or auxiliary action → `secondary`.

```tsx
<Button variant="secondary" onPress={cancel}>Cancel</Button>
<Button type="submit">Save</Button>
```

Do not make Cancel another primary button. Use native HeroUI variants. Chips default to HeroUI’s `soft` variant and retain native `color`, `variant` and `size` props; compose icons and spinners with `Chip.Label`.

## Validation and pending state

`TeamSetup` collects the team name, then date/time preferences. Continue validates locally; Complete Setup calls `onSubmit` once with the team name and the three preference values. The two dots beside the brand mark the current step. Back preserves both steps, and a failed request keeps the preferences screen ready to retry. Apps own the setup API call, its admin-role gate and success navigation.

`McpAuthorization` presents an already loaded consent request. Apps map it into the `client`, `resources` and `ceilings` props (or use `ConnectedMcpConsent`, which does), and supply `onApprove` and `onDeny`. Pass `approvalBlockedReason` when the account cannot grant the requested access; approval is disabled while denial remains available. Pass `isPending` during either decision and `error` on failure. Metadata published by a client does not verify the requesting app; the redirect host is always shown, with a warning for a redirect to this computer. The Storybook fixture simulates decisions without granting access.

`AuthForm` and `NameSettingsForm` show one validation toast and focus the invalid control. Server failures keep the draft and allow retry. Disable the submit action during its request; show a busy label. Never replace the whole page with an empty loading screen when existing data is available.

Submission failures use one danger toast, including inside modals. Keep the draft and dialog open, release the pending state, and allow retry. Do not also render an inline error or alert for the same failed submission. Load failures and persistent access restrictions remain in their owning surface.

Mount one `Toast.Provider` for the application, including public auth routes. Use `placement="bottom"` for bottom-center toasts; this is the native HeroUI default and the explicit placement used by AppShell and Storybook. Toast announcements, timers, stacking, motion, and placement retain HeroUI behavior. The close control is a documented accessibility exception: its 32px target is visible without hover on the front toast, expanded stack rows, and a focused toast. Hidden/exiting rows remain unreachable; collapsed background close controls do not intercept clicks.

The shared provider retains HeroUI's props and native rendering. It restores the connected control that preceded toast focus when the final toast exits and native focus was stranded on the document body. It does not move focus away from a control the user has since chosen, into an inert surface, or into a background browser tab. This keeps an initiating modal usable after pointer or keyboard toast dismissal.

Common identity and team names are trimmed, non-empty and limited to 120 characters; email addresses allow up to 320, and API key names 100. Keep API and database constraints aligned with these UI limits.

Use the standard Admin/Member/Viewer roles for common team settings. Roles are assigned in the identity provider, and apps enforce the permissions behind them; rendering a role label does not grant access. `teamRoleSchema` (`patterns/settings/schemas`) validates the three roles.

## Notifications and charts

`NotificationMenu` requires an icon on every row. Use a full-width hover area, a raised red unread badge, and the subtle Mark all as read action. Apps map their API data into the shared `NotificationItem` presentation contract: `id`, `title`, optional `message` and `source`, `href`, `icon`, formatted `time`, optional ISO `dateTime`, and `unread`. Backend event payloads remain app-owned. The menu supplies the theme-aware icon button, badge, popover, row layout, loading/empty states and navigation dismissal.

Use `isOpen` and `onOpenChange` when the app needs to refresh notifications on opening; otherwise the menu owns its open state, with optional `defaultIsOpen`. Opening the menu does not mark notifications read. Return `false` from `onActivate` (synchronously or asynchronously) when another app-owned operation makes activation inapplicable; the menu stays open without a toast. A fulfilled `void` result still dismisses the menu, and a rejected activation remains open with one danger toast. Supply `onMarkAllRead` for the explicit Mark all as read action, with `markingRead` during persistence. A `headerEnd` slot can compose that action with pagination controls; supply `Widget.Action` to retain the standard header style. Do not add Clear All, dismissal, or automatic read timers. Apps own persistence, polling, retention, counts and mutations; follow the [incoming notification contract](patterns.md#incoming-notifications).

`LineChart` supplies consistent axes, line width, colors, and tooltips. Its `Area` part supports filled or stacked series inside the same chart; define a chart-local SVG gradient for a fading fill. The plot margin leaves room for the top Y-axis tick. `Widget.Legend` wraps series within the card. Do not connect missing measurements as real data. Use dashed series for the previous period with `legendType="none"`. Keep each current metric and its previous-period row together in tooltips, with the change before the current value. Use `success-soft-foreground` and `danger-soft-foreground` for change text; fewer errors is an improvement. Format from the tooltip's datum, never by searching for a matching numeric value. Use Enable compare and Disable compare actions. Preserve measurements during refresh without adding refresh text. LineChart owns empty and initial loading states; its Legend, ReferenceLine and Selection parts are optional.

Auth screens are exported from their own files, rather than implemented inside Storybook. Sign-in is SSO only: `SignIn` has no credential fields, and `AccessDenied` and `StepUpDialog` send the person to the identity provider. No screen stores credentials, contacts an auth API or grants access on its own; the connected containers in `patterns/auth/connected` call the auth client.

`AuthForm` uses POST for native submissions, keeping field values out of URLs when JavaScript has not attached the submit handler. Normal interactive submissions await the app callback and prevent native navigation. This fallback does not create a server endpoint.

`PreferencesSettings` keeps a local draft and calls `onSave` once per submission. After saving, the app updates its `value` prop to the committed preferences. Date/time choices are followed directly by Save; the preview and explanatory footer are omitted. The older `formatPreview` prop is accepted for compatibility but does not render. `SessionsSettings` and `ApiKeysSettings` take app-owned items and await mutation callbacks; update the items only after the API succeeds, or optimistically with a restore on failure as the connected containers do. Failures retain the open dialog and draft for retry.

`CodeBlock.CopyButton` retains the visible Copy label and accessible Copy code name. Clipboard writes lock repeat presses immediately, expose native pending state, and unlock for retry after completion. Each completed attempt produces one success or danger toast; an unavailable or denied clipboard keeps the code visible for manual selection. A custom `aria-label` remains stable through success and failure. Copy status is not duplicated inline.

`ActionConfirmation` accepts `confirmLabel` and `cancelLabel` for concrete consequence actions. `SessionsSettings` uses Sign out and Keep signed in and explains that the other browser loses access at once. Sign out everywhere confirms that every browser, this one included, must sign in again.

`CreateApiKeyDialog` trims the key name before creation. A whitespace-only name produces one danger toast per submission and returns focus to Name, retaining the draft without calling `onCreate`. A corrected name is trimmed and passes through the existing pending guard. The new key's secret is shown once, with focus on Done; closing the dialog removes it.

## Sign-in

`AuthScreen` owns its responsive gutters; nesting it in `AuthPage` retains the same spacing as standalone use. Use `BrandLockup` with a 32px mark and the app name for every auth brand, aligned with the heading. Keep the native shared button typography and muted, dashed-underlined `AuthAction` links; do not override them in app CSS. `SignIn` shows a redirect error in a danger alert above the button, as a persistent state of the page rather than a submission failure. Use the product and provider names apps already show people, such as "Posted" and "authentik".

## Pending forms across overlay suspension

`AuthForm.isPending` accepts owner-level pending state when a suspended native portal remounts while its request is still settling. It combines with the form’s own submit lock, disables fields and actions, and prevents a repeat callback. Keep that state above the portal; clear it when the app cancels or settles the request. A current rejected attempt still shows one danger toast. Shared actions and clipboard controls suppress late feedback from an attempt invalidated by `OverlaySuspensionScope` or owner unmount; suspension does not undo server mutations or a completed clipboard write.

`TeamGeneralSettings` and other uses of `NameSettingsForm` retain their name draft and pending lock through a suspended save. Feedback from that invalidated attempt is suppressed after resume or owner unmount; settlement releases only its own request lock. Current failed saves show one danger toast per attempt and remain retryable. Apps still own committed values, cancellation and keyed unmount on account change.

## Display preferences

Use `dateFormatOptions`, `timeFormatOptions` and `defaultDateTimePreferences` from `@avgeek-oss/design-system/utilities/date-time-preferences` in account settings and onboarding. The React-free catalog defines the same five date and four time format IDs for every app. Stored defaults are `day-short-month-year`, `24-hour` and `UTC`. `browserDateTimePreferences` can suggest a supported browser time zone during onboarding; it does not replace stored preferences.

Apps validate and persist these IDs and convert legacy IDs without losing existing choices. Formatting follows the selected display preference. Domain DATE and UTC timestamp serialization remain app-owned wire contracts. Pass the catalog arrays to `DateTimePreferenceFields` along with supported IANA time zones.

## File uploads

Use `FileUpload` from the package root or `patterns/file-upload` for one attachment at a time. It provides a keyboard-accessible file-picker button and a drop area; it uploads immediately after selection. The default `accept` is `image/*,application/pdf` and the default size limit is 10 MiB. Apps should pass their supported MIME types/extensions, `maxSizeBytes`, a descriptive `description`, and `isDisabled` from permissions. The drop area is not a separate keyboard stop because the same action is available through the button.

Pass `initialFile` when an app-owned page drop opens an upload modal. The file present at mount is validated and uploaded once through the same pending, error and retry path; rerenders and StrictMode effect replay do not submit it again. Later changes to this prop are ignored: mount a new control for a new dropped file. An initially disabled control does not submit automatically when enabled; its retained file can be uploaded explicitly. The app owns page-level drag listeners and modal placement.

`onUpload(file)` must resolve only after the upload and metadata save succeed. Rejection shows one danger toast, preserves the selected file and exposes **Retry upload** and **Choose another file**. Pending state appears inside the initiating button and locks picker, drop and retry requests. Success clears the selection. Apps may show contextual success feedback after committing their attachment list; do not duplicate upload failures in the callback. The root forwards div attributes and a ref; use `className` for layout, not to restyle its buttons.

Client file checks are feedback only. Apps own storage, signed URLs, authentication, server validation, request cancellation and persisted attachment lists. Revalidate file type and size on the server; a browser MIME type is not proof of content. Use `ProfileImageSettings` for the account's existing Gravatar preference, rather than introducing an upload it does not support.
