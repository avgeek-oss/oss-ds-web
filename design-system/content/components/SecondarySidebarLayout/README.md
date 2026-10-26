# SecondarySidebarLayout

A page with a secondary sidebar: a 264px column on desktop, the navigation drawer on mobile.

**Use for** section pages with sub-navigation or filters, such as Account and Team settings. Top-level destinations belong in `ApplicationSidebar`.

**Provide** `SecondaryEntityHeader`, `SecondaryItems` (`items`, `selected`, `onSelect`), `SecondarySection`s, then the page content.

**Don't** add top padding when the host has an entity heading.
