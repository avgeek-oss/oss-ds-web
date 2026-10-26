# HistoryTable

A record table with history pagination and loading, refresh, error and filtered-empty states.

## When to use

For audit events, delivery attempts and other paged history. Use `ResourceTable` for a plain list.

## What the consumer provides

`items` (each needs an `id`), `columns` (`key`, `header`, `cell`), `label`, `emptyDescription`, optional `isFiltered`, `isLoading`, `isRefreshing`, `error`, `onRetry`, `pagination` (`page`, `hasNextPage`, `onPageChange`, optional `totalPages`). Compose `HistorySearch`/`HistoryFilter` above it.

## Key behavior

- During refresh existing rows stay visible and page changes are blocked.

## Do / Don't

- Keep cursor encoding, fetching, polling and filter serialization in the app.
- Don't pass an empty array to disguise a failed fetch; pass `error`.
