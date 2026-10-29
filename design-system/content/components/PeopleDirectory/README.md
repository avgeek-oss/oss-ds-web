# PeopleDirectory

A read-only directory of people mirrored from the identity provider: role, where it came from, last sign-in, suspended and deactivated badges.

**Use for** the People page. Roles and app access are changed in the provider, not in the app.

**Provide** `items` (`id`, `name`, `email`, `role` or `null` for suspended, `roleSource`, `active`, `lastSignInAt`), `providerName`, `formatDate`, optional `currentUserId`, `manageUrl`, `actions`.

**Don't** add role pickers or invitations.
