# Changelog

## 1.3.2 — 2026-10-27

- `AgentChat`: tool lines, approval details and tables use the paragraph type size and line height, tool status icons grow to match, and transcript items get more vertical room.

## 1.3.1 — 2026-10-26

- Point `repository.url` at `avgeek-oss/oss-ds-web`. npm now rejects a provenance-signed publish whose manifest names a different repository, which blocked the 1.3.0 publish; 1.3.1 carries the same changes as 1.3.0.

## 1.3.0 — 2026-10-26

- Add the `AgentChat` panel and `AgentChatTrigger` for assistant conversations, with inline approvals for actions that change data, client-tool activity, conversation history and a safe Markdown subset for replies.
- Add an optional right-hand `aside` to `AppLayout`: a docked column on desktop and a full-width drawer on small screens, one drawer at a time.

## 1.2.19

- Keep public component declarations portable when building from an immutable Git dependency in a nested pnpm store.

- Export DateRangePicker, RangeCalendar and TimeField, and add the responsive DateTimeRangePicker composition with a range calendar and start/end time controls.

## 1.2.18 — 2026-10-13

Publish the shared package publicly on npmjs.org with GitHub Actions trusted publishing. Public installation no longer requires GitHub Packages credentials. Verified tarballs and fresh registry consumer checks remain release gates; retries reject a version whose bytes differ from the verified candidate.

## 1.2.17 — 2026-10-13

- Keep personal and team API keys in a horizontally scrolling table on mobile.
- Remove redundant Active status chips and show expired keys in the Expires column.
- Replace the contributor component catalogue with Storybook, including component documentation, controls and interaction checks.

## 1.2.16 — 2026-10-11

- Use MCP server icons for MCP Connections and MCP Guide headings.
- Display Codex with the ChatGPT logo in connection tables, consent forms and revocation confirmations, including connections stored with a Codex metadata URL.
- Keep MCP connections in a horizontally scrolling table on mobile, with readable application names.
- Return keyboard focus to the initiating action after dismissing MCP connection revocation.

## 1.2.15

- Standardize MCP consent with an application input, user-selected Read-only, Write and Administrator scope, common role guidance and Deny/Approve actions. Return to the client through the app-owned denial callback.

## 1.2.14 — 2026-10-11

- Add a shared attachment file chooser and drop control with validation, stable upload progress, and retained retry after failure.
- Accept an initial dropped file so applications can open an upload modal and upload once, including under React Strict Mode.

## 1.2.13 — 2026-10-11

- Require an installation setup secret in the shared team setup form, retaining account details through failed submissions and retries.
- Allow applications to provide their own authentication email theme, including button and link colors.
- Document verified installation administrators and named authentication email senders.

## 1.2.12 — 2026-10-08

- Route the sidebar update notice independently from the application home link.
- Label passkey confirmation actions Use Passkey and explain the access confirmation.

## 1.2.11 — 2026-10-08

- Match secondary entity header icons to the 24px entity icons in page titles.

## 1.2.10 — 2026-10-08

- Support filled and stacked area series in the shared chart, with room for axis labels and wrapping widget legends.
- Inset searchable filter values and align secondary navigation icons with entity headers.

## 1.2.9 — 2026-10-08

- Add a shared backend-unavailable screen and automatic read-only reconnection with bounded requests and cleanup.

## 1.2.8 — 2026-10-08

- Add shared authentication emails with a server-safe renderer, loading skeletons, error pages and expandable attribute lists.
- Require explicit Name, Permissions and Expires after choices when creating API keys; standardize permission and expiry options without preselected values.
- Align breadcrumbs, sidebar toggles, secondary sidebar spacing, searchable picker padding, menu radii, calendar controls and mobile input typography.
- Dim read notification content to 50 percent and keep MCP client selectors compact on desktop.

## 1.2.7

- Align semantic status text and icons with soft-chip foregrounds in both themes; chip and account-menu icons inherit their labels.
- Combine avatar and name editing in Profile details, and omit redundant profile, preference and email-change instructions.
- Keep searchable picker results below a fixed search field while scrolling.

## 1.2.6

- Make searchable time-zone results scroll independently and highlight focused options without an overlapping outline.
- Add common settings titles, team role options, MCP guide and MCP connection settings patterns.
- Keep button-link icons spaced consistently and application page heading typography independent of consumer heading resets.

## 1.2.5 — 2026-10-07

- Show centered verification-email recovery only after a typed `EMAIL_NOT_VERIFIED` sign-in failure, clearing it on email edits and retries while preserving pending guards and toast feedback.
- Bring shared auth-action underlines closer to their text and document uniform branding and auth styling across team and personal apps.
- Keep auth headings left aligned and wrap long client names and descriptions on narrow screens.
- Avoid duplicate auth gutters when a shared auth screen is placed inside `AuthPage`.

## 1.2.4 — 2026-10-07

- Export a React-free shared date/time preference catalog with five date formats, four time formats and stored defaults for consistent account settings and onboarding.

- Suppress stale profile and team name-save feedback after session suspension or owner unmount, preserving the draft and request lock for a deliberate retry.

## 1.2.3 — 2026-10-07

- Add controlled email-link confirmation with explicit awaited actions, and invitation-code resend with a shared pending lock and server cooldown.
- Allow notification activation to return `false` without dismissing the menu or reporting a failure.
- Expose mobile navigation focus-restoration progress so destination autofocus can wait for native drawer dismissal without stealing focus.
- Add retained-overlay suspension for shared dialogs, popovers and preference selectors, preserving non-secret drafts while releasing native focus and scroll locks for replacement sign-in. Ignore stale async and clipboard feedback after suspension or owner unmount.

## 1.2.2 — 2026-10-07

- Keep auth form values out of URLs by using POST for native submissions before JavaScript handles the form.

- Lock recovery-code copying during clipboard writes, with one toast outcome and retry after failure.

- Add the public VerificationEmail flow and optional sign-in verification-email action, with neutral account copy, supported recovery actions, pending navigation guards and password clearing after completed sign-in attempts.

- Keep notification trigger geometry steady during pointer, touch and keyboard presses while retaining native popover interaction and other button behavior.

- Expose the native notification dialog ref for app-owned refresh and pagination focus recovery without changing popover focus behavior.

## 1.2.1 — 2026-10-07

- Share profile-image settings, invitation password setup, passkey recovery verification, team details settings, and team removal/revocation confirmations with fixed copy.
- Label team member security as Passkeys consistently and preserve a readable identity column on narrow member tables.
- Allow apps to cancel a pending passkey confirmation safely. Standardize new integrations on passkeys and deprecate the legacy authenticator fallback.

- Add an opt-in stacked mobile ResourceTable layout and enable it for API keys, preserving desktop columns, native table semantics and all credential metadata.

- Keep breadcrumb popover geometry steady through an opacity-only fade and restore native focus on interrupted-exit reopening without remounting the menu.
- Reject whitespace-only API-key names with toast feedback and input focus, retaining the draft for correction without creating a key.
- Restore mobile navigation focus to the current toggle after drawer exit when navigation replaced the original opener, while preserving deliberate destination focus.
- Add optional `titleOverflow="truncate"` to page patterns for a shrinking title and fixed-width actions on one row, retaining the wrapping default.
- Return API-key confirmation focus to its connected Revoke action after native table row or cell restoration.
- Keep ordinary query loading announcements visually hidden while retaining accessible status and explicit visible progress.
- Prevent repeated code-copy presses while a clipboard write is pending, with toast feedback and retry after failure.
- Discover browser regressions through one shared suite and reuse fixture serving, browser setup, and cleanup.

## 1.2.0 — 2026-10-06

- Support real secondary navigation links alongside action buttons, preserving native menu density, router integration, modified clicks, and mobile dismissal.
- Expose matching internal primary navigation links as the current page, with the same section boundaries and preserved child routes as visual selection.
- Await app-owned notification activation with duplicate request protection, toast-only failures, pending announcements, and retry/pagination composition slots. Use “Mark all as read” for the default header action.
- Standardize incoming notifications on explicit Mark all as read, durable per-user receipts, complete unread pagination and 24-hour read retention.
- Allow applications to omit unsupported API-key permissions, passkey management actions, email-change controls, and sign-in fallback methods.
- Support externally pending sign-in, app-owned identity-verification content, and disabled one-time authorization decisions.
- Add role-only member editing, truthful invitation-result guidance, invitation avatars, and current-user identity labels.
- Report clipboard success and failure through toasts with a stable copy action, and explain session revocation consequences.
- Keep toast close controls visible and reachable on touch and keyboard, with 32px targets on frontmost/expanded rows while hidden and exiting rows stay inactive. Restore initiating control focus when native final-toast dismissal leaves focus on the document body.

## 1.1.0 — 2026-10-06

- Restore full-width section dividers in the sidebar account menu while retaining padded labels and actions.
- Standardize bottom-center toasts and toast-only submission failures across forms, dialogs, confirmations, and shared mutation actions. Preserve drafts and keep dialogs open for retry; inline field validation and load/policy errors remain separate.
- Shared email/password settings, expanded API-key metadata, authorized clients, and save-once API-key creation.
- Member account/security status, invitation management, and separate invite/add/edit dialogs.
- History tables, search/filter controls, event details, and a draft-based filter builder.
- Notification destination subscriptions, provider connection cards, and operation progress.
- Shared semantic status, asynchronous confirmation/actions, and loading/error feedback.
- Controlled notification-menu state and custom header actions, with optional source labels.
- Component fixtures, public contracts, and interaction regression tests for retained drafts, pending actions, and secret dismissal.

## 1.0.0 — 2026-10-06

Initial shared React design system for Avgeek OSS applications.

- HeroUI primitives, fonts, semantic styles, charts, and form controls.
- Application shell, page layouts, breadcrumbs, routing context, and optional Next.js adapter.
- Separate authentication screens, two-step team setup, MCP authorization, account settings components, team members table, and resource tables.
- Interactive Cosmos coverage, usage documentation, contributor rules, and package verification.
