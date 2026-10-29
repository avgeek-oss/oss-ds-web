# Forms and feedback

## Inputs

- Use `Input`, `PasswordInput`, `Textarea`, `Select` and `InputGroup`. Searchable choices use `Autocomplete` with `SearchField`.
- Surface variant: `primary` on base and auth pages; `secondary` inside widgets, modals and drawers.
- Dates: `DatePicker` with `DateField.Group` and `Calendar`; `DateField` alone for segmented entry; `DateTimeRangePicker` for date-and-time intervals.
- Associate labels with controls and descriptions via `aria-describedby`. Keep one focus ring and native control heights.
- Selection values and menu options are 14px everywhere. Text-entry controls are 16px on mobile, 14px from `sm`.
- Truncate long selected values; keep trailing metadata in a separate right-aligned slot.
- Selectable `ListBox.Item` rows reserve 32px at the end for the tick. Never overlay metadata on it.
- Picker popovers use `--field-radius` plus an 8px inset. Don't add rounded classes to them.

## Buttons

- `Button` for actions, `ButtonLink` for navigation. Sizes `sm`, `md` (default), `lg`.
- Main action: default primary. Cancel or auxiliary: `secondary`. Destructive: `danger` or `danger-soft`.
- Never make Cancel a second primary button.

## Validation and pending

- Show one validation toast and focus the invalid control.
- Disable submit during its request and show a busy label.
- Submission failures: one danger toast, bottom center, even in modals. Keep the draft and dialog open; allow retry.
- Never also show an inline error for the same failed submission. Load failures and access restrictions stay in their own surface.
- Don't replace a page with a loading screen when existing data is available.
- Mount one `Toast.Provider` with `placement="bottom"` across authenticated and public routes.
- Name limits: identity and team names 1–120 characters, trimmed; email ≤ 320; API key names ≤ 100.

## Auth and settings

- `SignIn` shows the callback's redirect error above the button; `authRedirectErrorMessage` gives the copy for every code.
- Use `BrandLockup` with a 32px mark on every auth screen. Don't override auth button or `AuthAction` styling.
- `ActionConfirmation` takes concrete `confirmLabel` and `cancelLabel`, such as Sign out and Keep signed in.

## Notifications and charts

- Every `NotificationMenu` row needs an icon. Opening the menu never marks items read.
- Offer Mark all as read via `onMarkAllRead`. Don't add Clear all, dismissal or read timers.
- `LineChart`: never connect missing measurements. Show the previous period dashed with `legendType="none"`.
- Color change text with `success-soft-foreground` or `danger-soft-foreground`; fewer errors is an improvement.

## File uploads

- `FileUpload` handles one file at a time and uploads on selection. Defaults: images and PDF, 10 MiB.
- Pass supported types, `maxSizeBytes`, a `description` and `isDisabled`.
- `onUpload` resolves only after the upload and save succeed. Failures show one toast with Retry upload.
- Copy actions (`CodeBlock`) report one toast per attempt and keep the content selectable.
