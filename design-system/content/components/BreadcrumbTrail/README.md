# BreadcrumbTrail

The page's place in its hierarchy, ending with the current page.

**Use for** breadcrumbs outside `ApplicationPage`, which renders one from `breadcrumbAncestors`.

**Props** `items` in route order: `{ label, href }` ancestors, optional `content` dropdowns, final `{ label }`.

**Don't** add sidebar categories as ancestors or set active styles yourself.
