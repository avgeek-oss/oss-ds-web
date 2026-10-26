# QueryError

A failed-load message with an optional Retry; `QueryLoading` is its hidden loading announcement.

**Use for** a section whose data failed to load. Use a danger toast for failed submissions and `ErrorPage` for a whole route.

**Props** `QueryError`: `message`, `onRetry`. `QueryLoading`: children (default "Loading…").

**Don't** replace a failed request with an empty success state.
