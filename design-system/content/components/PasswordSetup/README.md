# PasswordSetup

Sets a new or first password, checking the confirmation locally.

**Use for** a reset link (`mode="reset"`) or a first password (`mode="first"`). The preview's mark is a stand-in.

**Provide** `brand`, awaited `onSubmit({ password, confirmPassword })`, `onBackToSignIn`, optional `minLength` and `passwordDescription`.

**Don't** change the fixed copy or restyle the auth layout.
