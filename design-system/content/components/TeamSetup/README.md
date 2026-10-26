# TeamSetup

Two-step first-run onboarding: account details, then date and time preferences.

The preview's brand mark is a stand-in: a 32px `accent` tile with an 8px radius beside the name "Avgeek". Apps pass their own `BrandLockup`.

## When to use

Once per installation, to create the team and its first administrator.

## What the consumer provides

`brand`, `preferenceOptions` (`dateFormats`, `timeFormats`, `timeZones` — use `dateFormatOptions`/`timeFormatOptions`), optional `initialPreferences` and `setupSecretDescription`, and one awaited `onSubmit` that verifies the required `setupSecret` before claiming the first administrator.

## Key behavior

- Fields: Installation setup secret, Team name, Your Name, Email, Password; names use the trimmed 120-character limit.

## Do / Don't

- Keep the standard heading, description, labels and actions; supply branding, data and callbacks only.
- Don't restyle heading alignment, button typography or text actions in an app wrapper.
- Report a rejected submission once, as a danger toast at bottom center; the screen keeps the draft for retry.
