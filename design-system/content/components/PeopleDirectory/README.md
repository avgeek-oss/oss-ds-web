# PeopleDirectory

A read-only directory of people mirrored from the identity provider: role, where it came from, last sign-in, and suspended, deactivated and deleted badges.

**Use for** the People page. Roles and app access are changed in the provider, not in the app.

**Provide** `items` (`id`, `name`, `email`, `role` or `null` for suspended, `roleSource` of `claims`, `scim` or `app`, `status` of `active`, `suspended`, `deactivated` or `deleted`, `lastSignInAt`), `providerName`, `formatDate`, optional `currentUserId`, `manageUrl`, `actions`. `ConnectedPeopleDirectory` loads it from the auth client.

**Don't** add role pickers or invitations.
