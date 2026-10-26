# NotificationDestinationsSettings

Chooses which event categories each outgoing destination receives.

**Use for** Slack channels, email and webhooks. Incoming notifications use `NotificationMenu`.

**Provide** `items`, `categories` (modes off · all · failures), awaited `onSubscriptionChange(item, category, mode)`, optional `onTest`, `onRemove`.

**Don't** update `items` before the API call succeeds.
