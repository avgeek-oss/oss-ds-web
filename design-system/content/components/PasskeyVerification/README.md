# PasskeyVerification

The second-factor step that waits on the app's WebAuthn passkey ceremony.

**Use for** sign-in after the password passes. The preview's mark is a stand-in.

**Provide** `brand`, `onRetry`, `onBackToSignIn`, optional `isPending`, `onCancelRequest`, `onRecoverySignIn`.

**Don't** add authenticator/TOTP flows; passkeys are the second factor.
