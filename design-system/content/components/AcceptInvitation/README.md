# AcceptInvitation

Landing screen for an email invitation: team, role and a verify-email action.

**Use for** invitations that need email-code verification; continue with `InvitationVerification`. Use `InvitationPasswordSetup` when the link itself proves identity.

**Provide** `brand` (preview uses a stand-in tile), `teamName`, `role`, `onVerifyEmail`, `onBackToSignIn`, optional `isPending`.

**Don't** change the standard copy or offer a verification method the app doesn't implement.
