# BackendUnavailable

A full-viewport outage screen with an accent spinner and "<app> is temporarily unavailable. Reconnecting automatically…".

## When to use

Use when the backend cannot serve the initial session or app data, with `useBackendReconnect` probing for recovery. Use `ErrorPage status="unavailable"` for a route-level outage the user retries.

## What the consumer provides

`appName`, plus section props.

## Key props

- `useBackendReconnect(probe)` retries read-only probes; resolving `true` ends the loop.

## Do / Don't

- Do keep known sessions and loaded content during background failures.
- Don't redirect to sign-in because the backend is unreachable.
