# ResourceTable

A record list built on `Table`, with row links, actions, a footer and an empty state.

**Use for** members, passkeys, sessions and API keys. Use `Table` for direct composition and `HistoryTable` for paginated history.

**Props** `ariaLabel`, `items`, `columns`, `getRowKey`, `emptyTitle`, `emptyDescription`; optional `getRowHref`, `emptyAction`, `footer`, `mobileLayout` (`scroll` · `stacked`).

**Don't** pass `[]` to hide a failed fetch.

Render directly in page content. Never wrap a table in `Widget`; the table owns its frame. Counts belong in the page heading or table footer.
