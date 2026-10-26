# LoadingSkeleton

A loading group with one accessible busy status; `SkeletonCard` placeholders inside it are decorative.

## When to use

Use when initial loading needs visible placeholders. Use `QueryLoading` for an announcement without layout, and `Spinner` for small pending regions.

## What the consumer provides

Children (usually `SkeletonCard` elements sized like the eventual layout) and an optional `aria-label` (default "Loading data").

## Key props

- `SkeletonCard`: a Widget-shaped placeholder (`surface-secondary` fill, 5% foreground shimmer); size it with `className` or `style`.

## Do / Don't

- Do mirror the final page's card heights and arrangement.
- Don't duplicate skeleton surfaces in apps; reuse these exports.
