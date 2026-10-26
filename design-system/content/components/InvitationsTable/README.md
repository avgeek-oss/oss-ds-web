# InvitationsTable

Pending invitations with copy-link, resend and revoke actions.

**Use for** Team settings, beside `MembersTable`. Avatars look up Gravatar and fall back to initials.

**Provide** `items`, `roles`, `formatDate`, and awaited `onCopyLink`, `onResend`, `onRevoke`. The app filters expired invitations.

**Don't** update `items` before the API call succeeds.
