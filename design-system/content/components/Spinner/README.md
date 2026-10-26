# Spinner

HeroUI's indeterminate loading spinner.

## When to use

Use inside buttons, chips and small regions while a request is pending. Use `Skeleton`/`LoadingSkeleton` for initial page loads, and `ProgressCircle` when progress is measurable.

## What the consumer provides

An `aria-label` when it stands alone; `aria-hidden` when adjacent text already announces the state.

## Key props

- `size`: `sm` · `md` · `lg`
- `color`: `accent` · `success` · `warning` · `danger` · `current` (inherits text color)

## Do / Don't

- Do use `color="current"` inside chips and buttons.
- Don't show a spinner and a skeleton for the same region.
