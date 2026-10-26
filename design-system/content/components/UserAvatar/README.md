# UserAvatar

A person's avatar built from an email: initials from the name (or the email's local part) and an automatic Gravatar lookup.

## When to use

Use for members, invitations and the account menu. Use `Avatar` for non-person entities or when the app already owns the image.

## What the consumer provides

`email` (required), optional `name`, optional `src` to bypass Gravatar, plus Avatar props such as `size`.

## Key props

- `email`: normalized (trimmed, lowercased) and SHA-256 hashed for `https://www.gravatar.com/avatar/<hash>?s=160&d=404&r=g`.
- `name`: initials use the first and last words; it also becomes the accessible name.
- `src`: an explicit image URL; skips the Gravatar lookup.

## Do / Don't

- Do pass the display name when known so initials and the accessible label read correctly.
- Don't add a separate Appearance setting; `ProfileImageSettings` manages the Gravatar image.
- The preview passes `src=""` to stay offline; in an app the component requests Gravatar.
