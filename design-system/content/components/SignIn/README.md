# SignIn

The shared email-and-password sign-in screen.

**Use for** public sign-in in every app. Recovery for unverified email appears only when `onSubmit` rejects with `code: "EMAIL_NOT_VERIFIED"`.

**Provide** `brand`, awaited `onSubmit({ email, password })`, `isPending`, `onForgotPassword`, `onResendVerification`, `onPasskeySignIn`. Preview mark is a stand-in.

**Don't** change the standard copy or restyle headings and buttons.
