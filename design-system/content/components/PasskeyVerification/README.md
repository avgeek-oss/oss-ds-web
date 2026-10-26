# PasskeyVerification

The second-factor step that waits on the app's WebAuthn passkey ceremony.

The preview's brand mark is a stand-in: a 32px `accent` tile with an 8px radius beside the name "Avgeek". Apps pass their own `BrandLockup`.

## When to use

After the password passes and the server holds a pending passkey challenge. Passkeys are the standard second factor.

## What the consumer provides

`brand`, `onRetry`, `onBackToSignIn`, optional `isPending`, `onCancelRequest` (abort the ceremony) and `onRecoverySignIn` (renders the recovery-code fallback). The app owns the WebAuthn ceremony.

## Key behavior

- Retry and fallbacks are disabled during the request; cancel and back stay available.
- `onAuthenticatorSignIn` is deprecated — don't add authenticator/TOTP flows.

## Do / Don't

- Keep the standard heading, description, labels and actions; supply branding, data and callbacks only.
- Don't restyle heading alignment, button typography or text actions in an app wrapper.
- Report a rejected submission once, as a danger toast at bottom center; the screen keeps the draft for retry.
