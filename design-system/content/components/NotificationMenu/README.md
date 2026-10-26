# NotificationMenu

The notification bell with an unread badge and a popover of recent events.

**Use for** the header actions of `ApplicationNavbar`. Outgoing destinations use `NotificationDestinationsSettings`.

**Provide** `items`, server `unreadCount`, `onMarkAllRead` with `markingRead`; optional `onActivate(item)`, `isOpen`/`onOpenChange`, `footer`.

**Don't** pass an empty array to hide a failed fetch.
