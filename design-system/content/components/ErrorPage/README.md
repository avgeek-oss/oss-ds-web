# ErrorPage

Route-level failure screen for 404, 500, unavailable and forbidden.

**Use for** a route that can't render. Use `QueryError` for a failed section, `BackendUnavailable` when the backend is down.

**Props** `status` not-found · server-error · unavailable · forbidden; optional `onRetry`, `returnHref`, `title`, `description`.

**Don't** show raw exception details or build app-specific error cards.
