# PasswordSetup

Sets a new password (reset) or a first password, with confirmation checked locally.

The preview's brand mark is a stand-in: a 32px `accent` tile with an 8px radius beside the name "Avgeek". Apps pass their own `BrandLockup`.

## When to use

After a reset link (`mode="reset"`, default) or when an account first receives a password (`mode="first"`).

## What the consumer provides

`brand`, awaited `onSubmit({ password, confirmPassword })`, `onBackToSignIn`, optional `minLength` and `passwordDescription` reflecting the app's password policy.

## Key behavior

- Matching passwords are validated before the callback runs.

## Do / Don't

- Keep the standard heading, description, labels and actions; supply branding, data and callbacks only.
- Don't restyle heading alignment, button typography or text actions in an app wrapper.
- Report a rejected submission once, as a danger toast at bottom center; the screen keeps the draft for retry.
