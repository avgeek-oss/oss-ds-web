# InviteMemberDialog

Creates an invitation from email and role, then shows the returned invite link.

## When to use

From the Members page's Create invitation action. `AddMemberDialog` creates a member directly; `MemberEditDialog` edits one.

## What the consumer provides

Controlled `isOpen`/`onOpenChange`, `roles`, optional `defaultRole`, `resultGuidance` describing the real delivery state, and awaited `onInvite({ email, role })` returning `{ inviteUrl }`. The app owns success toasts and delivery warnings.

## Key behavior

- The invite URL appears only after success, with neutral private-link guidance.

## Do / Don't

- Await the real API call in each callback and update `items`/`value` only after it succeeds.
- Report a failed mutation once, as a danger toast at bottom center; dialogs stay open with the draft retained.
- Keep the standard headings, labels and confirmation copy.
