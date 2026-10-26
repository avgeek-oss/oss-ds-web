# Typography

Text primitives: `TypographyHeading`, `TypographyParagraph`, `TypographyText`, `TypographyCode`, `Typography` and `TypographyProse`, mapped to the shared type scale.

## When to use

Use these for content text inside patterns and pages. Page titles come from `ApplicationPage`; do not rebuild them with headings.

## What the consumer provides

Children plus the props below; all accept native element props.

## Key props

- `TypographyHeading level` 1–6 → `heading-1`…`heading-6` (36/24/24/20/18/16px, tracking-tight); `elementType` overrides the tag.
- `TypographyParagraph size`: `sm` · `md` · `lg`; `weight`: `normal` · `medium` · `semibold`.
- `TypographyText textRole`: `body` · `label` · `supporting` · `caption`.
- `color`: `default` · `muted` · `danger`; `align`: `start` · `center` · `end`.
- `TypographyCode`: inline mono code on `default-soft`; `title` shows a tooltip.

## Do / Don't

- Do use `muted` for supporting text and captions.
- Don't set raw font sizes or colors in app markup.
