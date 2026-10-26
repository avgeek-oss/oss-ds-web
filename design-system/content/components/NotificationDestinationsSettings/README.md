# NotificationDestinationsSettings

Configures which event categories each outgoing notification destination receives.

## When to use

For outgoing destinations (Slack channels, email, webhooks). Incoming notifications use `NotificationMenu`.

## What the consumer provides

`items` (`id`, `label`, optional `description`/`icon`, `subscriptions` keyed by category ID), `categories` (`id`, `label`, `modes` from `off` | `all` | `failures`), awaited `onSubscriptionChange(item, category, mode)`, optional `onTest`, `onRemove`, `actions`, `toolbar`, `isDisabled`.

## Key behavior

- Two-mode categories render checkboxes; failure-aware categories render All / Failures only, plus Clear when Off is allowed.

## Do / Don't

- Await the real API call in each callback and update `items`/`value` only after it succeeds.
- Report a failed mutation once, as a danger toast at bottom center; dialogs stay open with the draft retained.
- Keep the standard headings, labels and confirmation copy.
- Categories describe the app's actual event types.
