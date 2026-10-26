# VerificationEmail

Requests a fresh email-verification link from a public route.

The preview's brand mark is a stand-in: a 32px `accent` tile with an 8px radius beside the name "Avgeek". Apps pass their own `BrandLockup`.

## When to use

Wire `SignIn.onResendVerification` to this screen; it is separate from one-use passkey recovery codes.

## What the consumer provides

`brand`, awaited `onSubmit({ email })` connected to the public verification endpoint, `onBackToSignIn`, optional `defaultEmail`.

## Key behavior

- Shows a neutral acknowledgement after success, with retry and back navigation.

## Do / Don't

- Keep the standard heading, description, labels and actions; supply branding, data and callbacks only.
- Don't restyle heading alignment, button typography or text actions in an app wrapper.
- Report a rejected submission once, as a danger toast at bottom center; the screen keeps the draft for retry.
