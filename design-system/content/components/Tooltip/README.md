# Tooltip

A brief label revealed on hover or focus; plus `TooltipText`, which shows the full text of a truncated value.

## When to use

Use Tooltip for a short description of a control. Use `TooltipText` to reveal clipped text in tables, titles and breadcrumbs. Use `Popover` when the content is more than a line or needs interaction.

## What the consumer provides

The trigger and tooltip text. `TooltipText` takes the visible text as children and the full value as `tooltip`.

## Key props

- Parts: `Tooltip`, `Tooltip.Trigger` (supports `render` for a custom element), `Tooltip.Content` (`placement`), `Tooltip.Arrow`. Default delays: 1500ms open, 500ms close.
- `TooltipText`: `tooltip`, `as`, `openOnPress`.

## Do / Don't

- Do give icon-only controls an accessible label as well; a tooltip doesn't replace it.
- Don't put essential instructions only in a tooltip.
