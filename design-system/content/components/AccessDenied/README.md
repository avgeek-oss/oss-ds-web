# AccessDenied

The screen for someone the identity provider has not given this app, whose role was removed, or who was deactivated.

**Use for** a `sign_in_denied` redirect error (`accessDeniedStatus(error)` gives the status) or a person the app knows is suspended.

**Provide** `brand`, `productName`, `providerName`, optional `status` (`unassigned`, `suspended`, `inactive`), `email`, `onTryAgain`.

**Don't** offer a way to request or grant access in the app; access is assigned in the provider.
