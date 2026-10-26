# BackendUnavailable

Full-viewport outage screen that reconnects automatically.

**Use for** when the backend can't serve the session or app data, with `useBackendReconnect`. Use `ErrorPage status="unavailable"` for a route-level outage.

**Provide** `appName`.

**Don't** redirect to sign-in because the backend is unreachable.
