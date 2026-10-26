# PreferencesSettings

Date format, time format and time zone pickers with a single Save.

## When to use

On the account Preferences page; the same five date and four time choices as onboarding.

## What the consumer provides

`value` (`dateFormat`, `timeFormat`, `timeZone`), `options` (from `utilities/date-time-preferences`), awaited `onSave(preferences)`. After saving, the app updates `value`. `formatPreview` is accepted for compatibility but no longer renders.

## Key behavior

- Keeps a local draft and calls `onSave` once per submission.

## Do / Don't

- Await the real API call in each callback and update `items`/`value` only after it succeeds.
- Report a failed mutation once, as a danger toast at bottom center; dialogs stay open with the draft retained.
- Keep the standard headings, labels and confirmation copy.
- Display preferences are separate from domain DATE and UTC wire formats; preserve existing preferences through app-owned legacy-ID conversion.
