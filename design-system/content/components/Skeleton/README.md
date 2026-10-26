# Skeleton

HeroUI's placeholder block for content that is loading.

## When to use

Use to sketch individual pieces of loading content. Use `LoadingSkeleton` with `SkeletonCard` for page-level loading with one accessible busy status.

## What the consumer provides

Dimensions through `className` or `style`; `animationType`.

## Key props

- `animationType`: `shimmer` (default) · `pulse` · `none`; animation stops under reduced motion.

## Do / Don't

- Do match the eventual content's size and arrangement.
- Don't leave skeletons in place after a load fails; show the error instead.
