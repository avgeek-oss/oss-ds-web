# ApplicationPage

Page frame inside `AppShell.Content`: title, optional actions and description, and breadcrumb.

**Use for** every product page. `ContentPage` and `StatusPage` share the title without the breadcrumb.

**Props** `title`, `breadcrumbAncestors`, optional `actions`, `badge`, `description`, `titleContent`; `titleOverflow` wrap · truncate.

**Don't** wrap children in extra top padding; the page owns that spacing.
