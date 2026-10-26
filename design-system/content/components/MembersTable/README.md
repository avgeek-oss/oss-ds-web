# MembersTable

Team members with avatar, role, account and security status.

**Use for** Team settings → Members. Avatars look up Gravatar and fall back to initials.

**Provide** `items`, row `actions`, `roles` (`teamRoleOptions`), optional `currentUserId` and `emptyDescription`.

**Don't** infer security status from passkeys; supply it from the app's 2FA state.
