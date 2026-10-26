# StatusIndicator

A status chip with a visible label, semantic color, optional icon and optional tooltip description.

## When to use

Use for domain statuses (deployments, operations, connections). Use a plain `Chip` for non-status metadata.

## What the consumer provides

A `StatusDescriptor`: `label`, optional `color` (Chip color), `icon`, `description`; plus Chip props such as `size`.

## Key props

- `description`: wraps the chip in a tooltip.
- `icon`: decorative, sized to 14px.

## Do / Don't

- Do map domain statuses to descriptors in the app; the library does not interpret strings such as `running` or `active`.
- Do keep a word on every status; color is never the only cue.
