The shared React UI for Avgeek OSS apps: HeroUI v3 primitives, an application shell, and reviewed auth, account-settings, team-settings and data patterns. Towbar is the baseline every other app adopts. The look is deliberately quiet: one accent hue over a near-neutral OKLCH ramp, Inter for everything, borderless fields, and soft status washes. Apps bring their accent, brand mark and data; the system owns structure, copy and states.

## Principles

- **One standard, many apps.** Use the published pattern for a flow (sign-in, profile, members, API keys) before composing your own. Keep its headings, labels, descriptions and confirmation copy; supply branding, data, capabilities, routes and server errors.
- **Native primitives.** Buttons, fields, chips, tables and overlays keep HeroUI's own variants, sizes and interaction. Shared CSS corrections are few and scoped (dialog padding, picker radius, chip wrapping, ListBox tick spacing); do not add global overrides in an app.
- **Semantic tokens only.** Paint with `background`, `surface`, `surface-secondary`, `foreground`, `muted`, `accent`, `danger`, `separator` and their siblings. Raw palette values live only in named tokens.
- **Typed data in, callbacks out.** Components never fetch, authorize or persist. Await mutations, block repeat submission, keep drafts on failure, close dialogs only after success.

## Content fundamentals

- **Sentence case** everywhere: titles, buttons, labels — "Reset your password", "Save your recovery codes", "Create invitation", "Mark all as read".
- **Second person, plain imperative.** Address the user as _you_; descriptions start with a verb: "Enter your email to request a password reset link." "Use a strong, unique password to secure your account." "Use the device or password manager where you saved your passkey."
- **Questions confirm destructive actions**, followed by the consequence in one sentence: "Revoke session?" — "That browser will lose access immediately and must sign in again."
- **Failures name the action and the next step**, briefly: "Could not save preferences. Try again." "Unable to confirm your identity. Try again." Show each submission failure once, as a danger toast at bottom center — never also inline.
- **Privacy-neutral acknowledgements.** Reset and verification requests confirm without revealing whether an account exists.
- **Fixed vocabulary.** Call passkey management _Passkeys_; passkeys are the second factor (no authenticator/TOTP codes). One-use _recovery codes_ are separate from email verification. Team roles are _Admin_, _Member_, _Viewer_. Names are trimmed, non-empty, at most 120 characters.
- **No emoji, no exclamation marks.** Typographic apostrophes ("You won’t be able to view it again.").

## Color

- The system is neutral-first. `background` (L 0.982 light / 0.09 dark) is the page; `surface` (0.998 / 0.16) carries cards, table rows and base fields; `surface-secondary` frames widgets and hosts the _secondary_ field variant inside widgets, modals and drawers; `overlay` lifts popovers, menus and dialogs. All share the hue of `accent` with chroma ≤ 0.001, so changing an app's accent re-tints nothing visibly but keeps the ramp coherent.
- **Set only the accent per app.** Never define separate surface or background ramps. Check both themes after changing it.
- `accent` fills primary buttons, selection and focus (`focus` aliases it). Use `accent-soft` + `accent-soft-foreground` for tinted, quieter emphasis. `accent-foreground` on `accent` measures 3.6:1 — keep primary labels short and medium weight.
- Body text is `foreground`; secondary text is `muted` (≥ 4.5:1 on `background` and `surface`). Hairlines use `separator`; control outlines use `border`.
- Status: `danger`, `warning`, `success` are the same color as their soft-chip foregrounds, so counts, standalone icons and chip text match. Use `danger` / `danger-soft` buttons for destructive actions. Status always pairs color with a word or icon — light `success` and `danger` are close in lightness.
- Charts use `chart-requested`, `chart-succeeded`, `chart-failed`; apps may override them.
- Scrims use `backdrop` (50% black light, 60% dark).

## Typography

- One family: **Inter Variable** (`sans`) for UI and content; **Geist Mono Variable** (`mono`) for code, keys and configuration.
- Headings use `tracking-tight` (−0.025em): `heading-1` 36/40 semibold down to `heading-6` 16/24. Application pages title with `page-heading` (18/28, medium, balanced wrap) inside `ApplicationPage`; auth screens use `auth-heading` (20/28, medium) start-aligned with the form.
- Body copy is `body` (16/24). `body-sm` (14/20) is the default UI size: table cells, supporting text, selection displays and menu options — 14px on every breakpoint. Only real text-entry inputs grow to 16px on mobile.
- `label` (14/20 medium) for field labels; `secondary-label` (12/16 medium, `muted`) for compact labels in secondary sections; `caption` (12/16, `muted`) for footers, timestamps, legends and widget actions; `widget-title` (14/20 semibold, `muted`).
- Use tabular numerals for values, counts and timestamps in lists.

## Spacing and layout

- Base step is 4px (`space-1`). Sibling cards, sections and fields sit `space-4` (16px) apart on both axes (`content-grid`).
- `AppShell.Content` owns 16px side gutters, no top padding and `space-20` (80px) bottom padding; `ApplicationPage` owns `space-5` (20px) above and below its title. Never add another top padding around page content.
- Dialogs (modal, alert dialog, drawer) pad `space-5` (20px), with 16px between header, body and footer; the close button sits in its own column at the top right.
- Desktop sidebar is `sidebar-width` (15rem) on `background` with a `separator` edge; below 64rem it becomes an 18rem drawer. Workspace content caps at `workspace-page-content-width` (80rem).
- Auth frames: below 640px, top-aligned with 32px vertical / 16px horizontal padding plus safe-area insets; from 640px, centered with 24px gutters. Heading block to form gap is `space-8`.

## Shape, depth and borders

- Radii come from one base (`radius` 8px). Fields and buttons use `field-radius` (12px); picker popovers use `picker-popover-radius` (field radius + 8px inset); widgets use `radius-2xl` (16px) frames with 12px inner panels; inline code uses `radius-md`.
- Fields are borderless (`field-border-width` 0) and rely on fill plus `field-shadow`. Cards take `surface-shadow`; overlays take `overlay-shadow`. In dark mode surface and field shadows vanish and overlays get a 1px inner highlight — depth comes from the lightness ramp.
- Widget content panels use `widget-content-shadow`: a 3% ring and a 1px soft drop.
- No gradients, except the faint accent wash on the sidebar identity button on hover (≥ 64rem, disabled under reduced transparency).

## Motion and states

- Sidebar open/close: 220ms in, 180ms out, `cubic-bezier(0.32, 0.72, 0, 1)`. Breadcrumb popovers fade only (120ms in, 80ms out). Every transition stops under `prefers-reduced-motion`; theme switches suppress transitions entirely.
- Focus is a 2px solid `focus` ring (4px offset on text actions, inset on list rows). Disabled is `disabled-opacity` (50%) and non-interactive.
- Pending: async buttons swap to a pending label and disable until the request settles. Loading surfaces use the shared skeletons (`surface-secondary` fill, 5% foreground shimmer, off under reduced motion). Empty tables show one muted row on `surface`.
- Inline text actions (widget actions, external links) are `muted` with a 1px dashed underline, turning `foreground` on hover.

## Iconography

- **Hugeicons free set** (`@hugeicons/core-free-icons` 4.3.5) through `HugeiconsIcon`: 24×24 grid, 1.5 stroke, round caps and joins, no fills. Inline and table icons render at 16px; brand marks at 32px.
- Icons beside text are decorative (`aria-hidden`); icon-only controls need an accessible label ("More actions", "Account menu").
- Icons inherit `currentColor` from their text token; chip icons inherit the chip foreground. The files in **Icons** are the set the library itself imports, inked in `eclipse` for preview.
- No emoji as icons.

## Brand

- Apps supply their own mark through `BrandLockup`: a 32px mark (8px radius tile) and the app name, left-aligned with the auth form. The **Logos** group holds the Avgeek dev mark used across the studio, in light and dark variants.
- Keep auth heading alignment, button typography and text-action styling as shipped.

## Using it

- Import the package root or a public subpath (`@avgeek-oss/design-system`), and `@avgeek-oss/design-system/styles.css` once through the app's Tailwind 4 build.
- Wrap the app in `Providers` (theme: system, light, dark) and `RouteProvider`; use `AppShell` + `ApplicationPage` for product pages and `AuthScreen` for public auth. Mount one toast provider for all routes.
- Prefer `ResourceTable` for item/column record lists and `Table` for direct composition; `DatePicker` for calendar entry and `DateField` for segmented entry; `ErrorPage` for 404, 500, unavailable and forbidden states.

## Components

- Every card is the real package build (`@avgeek-oss/design-system` 1.2.19) running on React 19, exposed as `window.AvgeekOSS`; previews mount it inside `RouteProvider` with no-op navigation. Use the card's export name exactly as shown (`BreadcrumbTrail`, `SecondarySidebarLayout`, `Textarea`, `QueryError`).
- `parseDate`, `parseDateTime` and `parseTime` from `@internationalized/date` ride along on the namespace for date and time values.
- Auth and shell previews use a plain `accent` tile in place of an app mark; supply your own through `BrandLockup`. Member avatars look up Gravatar by email and fall back to initials when offline.

The guides that follow — Layouts, Forms and feedback, Shared application patterns, Authentication emails and loading surfaces, and the Component catalog — are the library's own contracts, carried over verbatim.
