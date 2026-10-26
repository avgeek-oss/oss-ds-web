# MembersTable

Team members with avatar, role, account status and passkey/security status.

## When to use

On Team settings → Members. Personal apps omit team capabilities.

## What the consumer provides

`items` (`Member`: `id`, `name`, `email`, `role`, optional `accountStatus`, `securityStatus`, `emailVerified`), row `actions`, `roles` (use `teamRoleOptions` for Admin/Member/Viewer), optional `currentUserId` (labels “(you)”), `emptyDescription`.

## Key behavior

- Supply security status from the app's 2FA state; don't infer it from passkey presence.
- Avatars use `UserAvatar`: initials with a Gravatar lookup by email (the preview's lookups 404 and fall back to initials).

## Do / Don't

- Await the real API call in each callback and update `items`/`value` only after it succeeds.
- Report a failed mutation once, as a danger toast at bottom center; dialogs stay open with the draft retained.
- Keep the standard headings, labels and confirmation copy.
