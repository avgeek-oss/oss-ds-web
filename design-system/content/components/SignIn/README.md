# SignIn

The shared SSO sign-in screen: one "Continue with <provider>" button.

**Use for** public sign-in in every app. There are no passwords, passkeys or email codes; the organisation's identity provider signs people in.

**Provide** `brand`, `productName`, `providerName`, `onContinue` (navigate to the client's `signInUrl(returnTo)`), optional `error` from `readAuthRedirectError`, `isPending`. Preview mark is a stand-in.

**Don't** add credential fields, change the standard copy or restyle headings and buttons. `ConnectedSignIn` does the URL work for you.
