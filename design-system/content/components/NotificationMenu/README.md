# NotificationMenu

The notification bell with an unread badge and a popover of recent events, with a Mark all as read action.

## When to use

Use NotificationMenu in the header actions of `ApplicationNavbar`. Notification destination settings are a separate pattern.

## What the consumer provides

`items` mapped from server events (`id`, `title`, `message?`, `source?`, `href`, `icon` (required), formatted `time`, `dateTime?`, `unread`), the server's total `unreadCount`, and `onMarkAllRead` with `markingRead` while it persists. Read state lives on the server.

## Key props

- `isOpen` / `onOpenChange` to refresh on open, or `defaultIsOpen`; opening never marks anything read.
- `onActivate(item)` to await a read mutation before navigating; return `false` when activation doesn't apply.
- `loading`, `emptyContent`, `footer` (pagination or retry), `headerEnd`, `dialogRef`.

## Do / Don't

- Do keep loaded rows when a refresh fails and report the failure with a toast.
- Don't pass an empty array to hide a failed fetch.
