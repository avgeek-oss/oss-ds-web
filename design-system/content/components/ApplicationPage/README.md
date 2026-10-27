# ApplicationPage

Page frame inside `AppShell.Content`: title, optional actions and description, and breadcrumb.

**Use for** every product page. `ContentPage` and `StatusPage` share the title without the breadcrumb.

**Props** `title`, `breadcrumbAncestors`, optional `actions`, `badge`, `description`, `titleContent`; `titleOverflow` wrap · truncate.

**Title icons** use 19px, matching secondary sidebar headings. Use `SettingsPageTitle` as `titleContent` for common account and team settings pages.

**Spacing** 16px above and below the title, shared with `ContentPage` and `StatusPage`.

**Don't** wrap children in extra top padding; the page owns that spacing.
