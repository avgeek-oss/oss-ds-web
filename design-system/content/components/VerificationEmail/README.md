# VerificationEmail

Requests a new email-verification link from a public route.

**Use for** `SignIn.onResendVerification`. It is separate from passkey recovery codes.

**Provide** `brand`, awaited `onSubmit({ email })`, `onBackToSignIn`, optional `defaultEmail`. Preview mark is a stand-in.

**Don't** change the standard copy or restyle headings and buttons.
