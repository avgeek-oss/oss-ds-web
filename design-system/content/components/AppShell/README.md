# AppShell

The application frame: a 240px primary sidebar, a header with navigation toggle, breadcrumb and actions, and the content column.

## When to use

Use AppShell with `AppLayout`, `ApplicationSidebar`, `ApplicationNavbar` and `ApplicationPage` for every product page. Public authentication uses `AuthScreen` instead.

## What the consumer provides

- `policy` (`{ kind, themeControl?, toasts? }`) and `contentWidth` (`small`, `compact`, `relaxed`, `broad`, `full`).
- `AppLayout`: `sidebar`, `navbar`, controlled `sidebarOpen` / `onSidebarOpenChange` (or `usePersistentAppSidebar(key)`).
- `ApplicationSidebar` `config`: brand (`id`, `title`, `accessibleLabel`, `logo`), `homeHref`, `groups` of link items (`href`, `label`, Hugeicons `icon`, optional `activePath`, `badge`, `preserveSubroute`), optional `brandVersion` / `brandUpdateVersion`, and `footerContent` (usually `SidebarAccountMenu`).
- `ApplicationNavbar`: brand, sidebar toggle wiring, `actions` (e.g. `NotificationMenu`), `showThemeSwitcher`.
- A `RouteProvider` with the current pathname and the app's navigate function.

## Key props

`AppShell.Content` owns 16px side gutters and 80px bottom padding; below 1024px the sidebar becomes an 18rem drawer.

## Do / Don't

- Do set `activePath` when a link's destination is one child of a section.
- Don't add top padding around page content.

The preview uses a plain accent tile in place of an app logo.
