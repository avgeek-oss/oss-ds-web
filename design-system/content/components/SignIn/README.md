# SignIn

The shared email-and-password sign-in screen, with forgot-password, passkey and verification-email recovery actions.

The preview's brand mark is a stand-in: a 32px `accent` tile with an 8px radius beside the name "Avgeek". Apps pass their own `BrandLockup`.

## When to use

Public sign-in for every Avgeek OSS app, inside `AuthScreen`/`AppShell` routing owned by the app.

## What the consumer provides

`brand` (a `BrandLockup`), awaited `onSubmit({ email, password })`, optional `defaultEmail`, externally controlled `isPending`, and navigation callbacks `onForgotPassword`, `onResendVerification`, `onPasskeySignIn`. The app owns the authentication request, the WebAuthn ceremony and routing.

## Key behavior

- `isPending` disables the form, forgot-password and passkey actions while keeping drafts.
- **Need a new verification email?** appears only when `onSubmit` rejects with `code: "EMAIL_NOT_VERIFIED"` and `onResendVerification` is supplied — preserve that code through app error adapters; never match message text.

## Do / Don't

- Keep the standard heading, description, labels and actions; supply branding, data and callbacks only.
- Don't restyle heading alignment, button typography or text actions in an app wrapper.
- Report a rejected submission once, as a danger toast at bottom center; the screen keeps the draft for retry.
