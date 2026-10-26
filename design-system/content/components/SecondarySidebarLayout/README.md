# SecondarySidebarLayout

Lays out a page with a secondary sidebar: on desktop (≥ 1024px) a 264px column beside the content, on mobile portalled into the navigation drawer.

## When to use

Use it inside `AppLayout` for section pages with their own sub-navigation or filters, such as Account settings and Team settings. Top-level destinations belong in the primary `ApplicationSidebar`.

## What the consumer provides

Children: `SecondaryEntityHeader` (optional title and 18px icon), one or more `SecondaryItems` and `SecondarySection`s, then the page content. The app owns routes, the selected id and actions.

## Key props

- `SecondaryItems`: `title`, `items` (`{ id, href?, label, icon?, badge?, destructive?, disabled?, disabledReason? }`), `selected`, `onSelect`. Items with `href` render `RouteLink`s with `aria-current="page"` on the selected one; items without are action buttons.
- `SecondarySection`: `title` plus filter controls; labels inside get the compact 12px muted style.

## Do / Don't

- Do use `ChoiceField`, `HistoryFilter` or native pickers in sections without app label classes.
- Don't add top padding to the host when it has an entity heading; the heading owns that spacing.
