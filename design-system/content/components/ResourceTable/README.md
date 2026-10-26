# ResourceTable

A record list composed from `Table`: pass items and column definitions to get record links, row actions, a footer and an empty state.

## When to use

Use for record lists such as members, passkeys, sessions and API keys. Use `Table` for direct compound composition, and `HistoryTable` when the list needs history pagination plus loading, error and filter states.

## What the consumer provides

`ariaLabel`, `items`, `columns` (`key`, `header`, `cell(item)`, optional `className`, `headerClassName`, `isRowHeader`, `mobileFullWidth`, `wrapRowLink`), `getRowKey`, `emptyTitle`, `emptyDescription`; optional `getRowHref`, `emptyAction`, `emptyMedia`, `footer`, `onRowLinkIntent`, `onRowLinkNavigate`, `mobileLayout`.

## Key props

- `getRowHref`: makes rows navigable through `RouteProvider`.
- `mobileLayout`: `scroll` (default) or `stacked`, which lays each row out as a two-column detail grid below 640px.
- `ResourceName`: name plus optional description cell content.

## Do / Don't

- Do give action columns a right-aligned header (`headerClassName="text-right"`) to match the cell.
- Do pass `[]` only for a genuinely empty list, never to hide a failed fetch.
- Don't add a separate status column when the pattern documents status inline (for example API keys).
