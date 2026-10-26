# ForgotPassword

Requests a password reset link for an email address.

The preview's brand mark is a stand-in: a 32px `accent` tile with an 8px radius beside the name "Avgeek". Apps pass their own `BrandLockup`.

## When to use

The Forgot password? destination from `SignIn`; follow a success with `ResetLinkSent`.

## What the consumer provides

`brand`, awaited `onSubmit({ email })`, `onBackToSignIn`, optional `defaultEmail`. The app sends the email and owns token generation and expiry.

## Key behavior

- Copy is fixed: **Reset your password** — "Enter your email to request a password reset link."
- Field drafts and validation survive a rejected request.

## Do / Don't

- Keep the standard heading, description, labels and actions; supply branding, data and callbacks only.
- Don't restyle heading alignment, button typography or text actions in an app wrapper.
- Report a rejected submission once, as a danger toast at bottom center; the screen keeps the draft for retry.
- Keep the acknowledgement privacy-neutral: never reveal whether an account exists.
