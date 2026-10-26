# InviteMemberDialog

Creates an invitation from email and role, then shows the invite link.

**Use for** the Members page's Create invitation action. `AddMemberDialog` adds a member directly.

**Provide** `isOpen`, `onOpenChange`, `roles`, `resultGuidance`, and awaited `onInvite({ email, role })` returning `{ inviteUrl }`.

**Don't** close the dialog on failure; show one danger toast and keep the draft.
