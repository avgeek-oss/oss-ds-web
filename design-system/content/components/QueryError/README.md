# QueryError

A failed-load message in `danger` with an optional Retry button; `QueryLoading` is its visually hidden loading announcement.

## When to use

Use for a section whose data failed to load. Use a danger toast for failed submissions, and `ErrorPage` when the whole route cannot render.

## What the consumer provides

`QueryError`: `message`, optional `onRetry`. `QueryLoading`: descriptive children (default "Loading…").

## Key props

- `QueryError` renders the message with `role="alert"` and a secondary Retry button.
- `QueryLoading` uses `role="status"` and `sr-only`; pass `className="not-sr-only"` for a deliberately visible message.

## Do / Don't

- Do keep loaded records visible when a refresh fails.
- Don't replace a failed request with an empty success state.
