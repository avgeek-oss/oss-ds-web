# HistoryTable

A paged record table with loading, refresh, error and filtered-empty states.

**Use for** audit events and other paged history. Use `ResourceTable` for a plain list.

**Provide** `items`, `columns`, `label`, `emptyDescription`, `pagination`, and optional `isLoading`, `isRefreshing`, `error`, `onRetry`, `isFiltered`.

**Don't** pass an empty array to hide a failed fetch; pass `error`.
