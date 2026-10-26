# Widget

The shared card surface: a `surface-secondary` frame with an optional header, an inset `surface` content panel, a footer and legend parts.

## When to use

Use for related form content and metrics. Use `Attributes` (card variant) for a read-only label/value card, and `EmptyState` inside `Widget.Content` for empty sections.

## What the consumer provides

Children: `Widget.Header` (with `Widget.Title` and optional `endContent`), `Widget.Content`, optional `Widget.Footer` with `Widget.FooterDescription`, `Widget.Action`, `Widget.Legend` and `Widget.LegendItem` (`color`).

## Key props

- `Widget.Title`: `icon`, `help` (heading documentation).
- `Widget.Action`: inline muted text action with a dashed underline; works as a button or link.
- `Widget.LegendItem color`: a CSS color, usually a chart token such as `var(--chart-requested)`.

## Do / Don't

- Do put filled buttons inside `Widget.Content` or page actions; header and footer buttons render as inline actions.
- Do use the `secondary` input variant for fields inside widgets.
- Don't nest widgets or override the frame and panel radii.
