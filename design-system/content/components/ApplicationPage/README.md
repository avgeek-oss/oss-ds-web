# ApplicationPage

The page frame inside `AppShell.Content`: an 18px medium title with optional badge, actions and description, 20px above and below, and the shell breadcrumb.

## When to use

Use ApplicationPage for every product page. `ContentPage` and `StatusPage` share the title layout without the shell breadcrumb; settings pages use `SettingsPageTitle` in `titleContent`.

## What the consumer provides

`title`, `breadcrumbAncestors` (navigable ancestors, `[]` for top-level pages), optional `actions`, `badge`, `description`, `titleContent`, and the page children.

## Key props

- `titleOverflow`: `wrap` (default) or `truncate` to keep title and actions on one row (the title truncates with a tooltip).
- `breadcrumbContent` / `breadcrumbLabel` customise the current breadcrumb item.

## Do / Don't

- Do place forms and widgets as direct children; the page owns heading-to-content spacing.
- Don't wrap children in an extra `pt-4` or gap.
