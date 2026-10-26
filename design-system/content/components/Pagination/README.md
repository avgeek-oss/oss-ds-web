# Pagination

Moves through pages of a list with Previous / Next and bounded page numbers, for known or cursor-style totals.

## When to use

Use the managed form beneath tables and lists that load page by page. `ResourceTable` and the settings tables compose it already; reach for it directly only for a custom list.

## What the consumer provides

The current one-based `page`, `totalPages` (or `null` when only next-page availability is known, with `hasNextPage`), and `onPageChange(page)`. The app owns fetching and keeps loaded rows when a page request fails.

## Key props

- `page`, `totalPages`, `hasNextPage`, `onPageChange` — managed mode; shows first, last and neighbours with ellipses, plus a "Page n of m" summary.
- Without `page`, it is the native HeroUI compound (`Pagination.Content`, `Item`, `Link`, `Previous`, `Next`, `Ellipsis`, `Summary`).

## Do / Don't

- Do pass `totalPages={null}` for cursor pagination instead of guessing a total.
- Don't mix the managed props with native children.
