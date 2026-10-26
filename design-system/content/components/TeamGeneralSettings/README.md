# TeamGeneralSettings

The Team details widget: team name, optionally with a description.

## When to use

On Team settings → General.

## What the consumer provides

Default mode: `value` (name) and awaited `onSave(name)`. `mode="details"`: `value` `{ name, description }`, awaited `onSave(values)`, optional `maxDescriptionLength` (500). Optional `maxLength` (120).

## Key behavior

- Set `mode="details"` only when the server supports a description.

## Do / Don't

- Await the real API call in each callback and update `items`/`value` only after it succeeds.
- Report a failed mutation once, as a danger toast at bottom center; dialogs stay open with the draft retained.
- Keep the standard headings, labels and confirmation copy.
- Don't show unsupported fields.
