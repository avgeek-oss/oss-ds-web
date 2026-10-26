Shared React UI for Avgeek OSS apps: HeroUI v3 primitives, an app shell, and auth, settings and data patterns. Quiet by design: one accent over a near-neutral ramp, Inter throughout, borderless fields. Apps bring their accent, mark and data; the system owns structure, copy and states.

## Principles

- **Use the published pattern** for a flow before building your own, and keep its copy.
- **Keep HeroUI's native variants**; no global overrides in apps.
- **Semantic tokens only**: `background`, `surface`, `foreground`, `muted`, `accent`, `danger`, `separator`.
- **Typed data in, callbacks out.** Components never fetch or persist; dialogs close only after success.

## Writing

- Sentence case: "Reset your password", "Create invitation".
- Address _you_; descriptions start with a verb: "Enter your email to request a password reset link."
- Confirm destructive actions with a question plus the consequence: "Revoke session?" — "That browser will lose access immediately."
- Failures name the action and the next step: "Could not save preferences. Try again." One danger toast, bottom center, never also inline.
- Vocabulary: _Passkeys_ (no TOTP), _recovery codes_, roles _Admin_, _Member_, _Viewer_. Names ≤ 120 characters.
- No emoji, no exclamation marks.

## Color

- Neutral-first: `background` for the page, `surface` for cards and base fields, `surface-secondary` for widget frames and secondary fields, `overlay` for popovers and dialogs.
- Set only `accent` per app; the neutral ramp takes its hue.
- `accent` fills primary actions, selection and `focus`. `accent-soft` with `accent-soft-foreground` for quieter emphasis.
- Text is `foreground`; secondary text is `muted`. Hairlines use `separator`, outlines `border`.
- `danger`, `warning`, `success` match their soft-chip text. Always pair status with a word or icon.
- Charts: `chart-requested`, `chart-succeeded`, `chart-failed`.

## Type

- **Inter Variable** for UI; **Geist Mono Variable** for code.
- Headings `heading-1`–`heading-6`, tracking −0.025em. Pages use `page-heading`; auth screens `auth-heading`.
- `body-sm` (14/20) is the default UI size; `body` (16/24) for prose. Only text inputs grow to 16px on mobile.
- `label` for fields, `caption` (muted) for footers and timestamps. Tabular numerals in lists.

## Layout

- 4px base. Siblings sit `space-4` (16px) apart.
- `AppShell.Content`: 16px gutters, 80px bottom. `ApplicationPage`: 20px around the title. Don't add top padding.
- Dialogs pad 20px, 16px between header, body and footer.
- Sidebar `sidebar-width` (15rem), a drawer below 64rem. Content caps at 80rem.

## Shape and depth

- `radius` 8px base; fields and buttons `field-radius` (12px); widgets `radius-2xl` (16px).
- Fields are borderless, with `field-shadow`. Cards `surface-shadow`, overlays `overlay-shadow`. Dark mode relies on the lightness ramp instead.
- No gradients.

## Motion and states

- Sidebar: 220ms in, 180ms out. All motion stops under reduced motion.
- Focus: 2px solid `focus` ring. Disabled: 50% opacity.
- Pending buttons swap to a pending label. Loading uses the shared skeletons.
- Text actions are `muted` with a dashed underline.

## Icons and brand

- Hugeicons free set: 24px grid, 1.5 stroke, 16px inline. Icons beside text are decorative; icon-only controls need a label.
- Apps supply a 32px mark through `BrandLockup`, left-aligned with auth forms. **Logos** holds the Avgeek dev mark.

## Using it

- Import `@avgeek-oss/design-system` and its `styles.css` once through Tailwind 4.
- Wrap in `Providers` and `RouteProvider`; use `AppShell` + `ApplicationPage` for pages, `AuthScreen` for auth.
- Cards run the real package on React 19 as `window.AvgeekOSS`. Use export names as shown (`BreadcrumbTrail`, `Textarea`, `QueryError`).
