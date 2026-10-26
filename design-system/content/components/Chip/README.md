# Chip

A compact single-line label for status, category or count, using HeroUI's native colors, variants and sizes.

## When to use

Use for short metadata inside rows, cards and headers. Use `StatusIndicator` when the chip represents a domain status with an optional icon and tooltip.

## What the consumer provides

Children (text, or an icon/`Spinner` plus `Chip.Label`). Import from `@avgeek-oss/design-system/data-display/chip`.

## Key props

- `color`: `default` · `accent` · `success` · `warning` · `danger`
- `variant`: `soft` (default) · `primary` · `secondary` · `tertiary`
- `size`: `sm` · `md` · `lg`
- `Chip.Label` wraps text when composing an icon or spinner.

## Do / Don't

- Do keep labels to one or two words; chips never wrap, and containers reserve their intrinsic width.
- Do let chip icons inherit the chip foreground.
- Don't override white-space or word-breaking in an app, or restyle the chip with raw colors.
