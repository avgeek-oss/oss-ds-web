# ForgotPassword

Requests a password reset link for an email address.

**Use for** the Forgot password? destination from `SignIn`; follow success with `ResetLinkSent`. The preview's mark is a stand-in.

**Provide** `brand`, awaited `onSubmit({ email })`, `onBackToSignIn`, optional `defaultEmail`.

**Don't** reveal whether an account exists, or change the fixed copy.
