# Avatar

A HeroUI avatar showing an image with an initials fallback, in native sizes, colors and variants.

## When to use

Use for entities with an image you already have, or a generic identity mark. Use `UserAvatar` for people identified by email; it derives initials and looks up Gravatar.

## What the consumer provides

`aria-label`, `Avatar.Image` (`src`, `alt`) and `Avatar.Fallback` (initials).

## Key props

- `size`: `sm` · `md` · `lg`
- `color`: `default` · `accent` · `success` · `warning` · `danger`
- `variant`: `default` · `soft`

## Do / Don't

- Do always provide a fallback.
- Don't use color to encode status on avatars; use a Chip or StatusIndicator beside the name.
