# AcceptInvitation

The landing screen for an email invitation: team, role and a verify-email action.

The preview's brand mark is a stand-in: a 32px `accent` tile with an 8px radius beside the name "Avgeek". Apps pass their own `BrandLockup`.

## When to use

When the server requires email-code verification before joining; continue with `InvitationVerification`. Use `InvitationPasswordSetup` when the invite link itself establishes identity.

## What the consumer provides

`brand`, `teamName`, `role`, `onVerifyEmail`, `onBackToSignIn`, optional `isPending`.

## Key behavior

- Don't display a verification method the app doesn't implement.

## Do / Don't

- Keep the standard heading, description, labels and actions; supply branding, data and callbacks only.
- Don't restyle heading alignment, button typography or text actions in an app wrapper.
- Report a rejected submission once, as a danger toast at bottom center; the screen keeps the draft for retry.
