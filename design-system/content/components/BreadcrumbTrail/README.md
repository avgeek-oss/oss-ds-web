# BreadcrumbTrail

Shows the page's place in its navigable hierarchy, ending with the current page in medium foreground text.

## When to use

Use BreadcrumbTrail for links and current-page labels. `ApplicationPage` renders the shell breadcrumb for you from `breadcrumbAncestors`; use the trail directly only outside that page shell. Ancestors are navigable pages — never sidebar categories such as Operate, Monitor or Settings.

## What the consumer provides

`items` in route order: each `{ label, href }` for an ancestor link, `{ label, content }` for an interactive entity dropdown, and a final `{ label }` for the current page. Plain non-linked ancestors are omitted.

## Key props

- `items`: the hierarchy.
- Entity switchers: compose `BreadcrumbDropdown.Root/Trigger/Popover/Menu/Item/ItemIndicator` in an item's `content`; for a searchable selector use `BreadcrumbSelect.Root/Trigger/Value/Popover` with `ListBox`, `Autocomplete.Filter` and `SearchField`.

## Do / Don't

- Do let the trail decide emphasis; only the last item is current. Ancestors stay regular muted text on hover, focus and open.
- Don't assign active styles yourself, and don't add top-level ancestors for top-level pages (`breadcrumbAncestors={[]}`).
