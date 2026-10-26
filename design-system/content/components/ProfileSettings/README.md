# ProfileSettings

The Profile details widget: a single name form with Save.

## When to use

On the account Profile page inside `ApplicationPage`, with no extra wrapper padding.

## What the consumer provides

`value` (saved name), awaited `onSave(name)`, optional `title` (default **Profile details**), `label` (default **Your Name**) and `maxLength`. `email` is deprecated — the widget no longer shows an avatar.

## Key behavior

- The name draft and pending lock survive a suspended save.

## Do / Don't

- Await the real API call in each callback and update `items`/`value` only after it succeeds.
- Report a failed mutation once, as a danger toast at bottom center; dialogs stay open with the draft retained.
- Keep the standard headings, labels and confirmation copy.
- Names are trimmed, non-empty, at most 120 characters — match the app's API and database limits.
