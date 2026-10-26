# InvitationsTable

Pending invitations with copy-link, resend and revoke actions.

## When to use

Beside `MembersTable` on Team settings.

## What the consumer provides

`items` (`id`, `email`, optional `name`, `role`, `expiresAt`, optional `status`), `roles`, `formatDate`, optional awaited `onCopyLink`, `onResend`, `onRevoke`, or custom `actions`. The app filters expired and revoked invitations.

## Key behavior

- Resend confirms the previous link will stop working; revoke confirms the invitation will no longer work.
- Avatars use `UserAvatar` (Gravatar lookup by email; initials fallback).

## Do / Don't

- Await the real API call in each callback and update `items`/`value` only after it succeeds.
- Report a failed mutation once, as a danger toast at bottom center; dialogs stay open with the draft retained.
- Keep the standard headings, labels and confirmation copy.
