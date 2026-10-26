# ErrorPage

The route-level failure screen for 404, 500, unavailable and forbidden states, with icon, code, heading, explanation and recovery actions.

## When to use

Use when a route cannot render. Use `QueryError` for a failed section inside a rendered page, and `BackendUnavailable` when the backend cannot serve the initial session.

## What the consumer provides

`status`; optional `onRetry`, `isPending`, `returnHref`, `returnLabel` (default "Go to home"), `title`, `description`, and children for extra recovery actions.

## Key props

- `status`: `not-found` (404) · `server-error` (500) · `unavailable` · `forbidden` (403).
- Try again appears only when `onRetry` is supplied; the return link becomes secondary beside it.

## Do / Don't

- Do keep the standard copy unless the app has a more specific, user-facing explanation.
- Don't show raw exception details or build app-specific error cards.
