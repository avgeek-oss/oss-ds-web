# SecondarySidebarLayout

A page with a secondary sidebar: a 264px column on desktop, the navigation drawer on mobile.

**Use for** section pages with sub-navigation or filters, such as Account and Team settings. Top-level destinations belong in `ApplicationSidebar`.

**Provide** `SecondaryEntityHeader`, `SecondaryItems` (`items`, `selected`, `onSelect`), `SecondarySection`s, then the page content.

**Don't** add app-specific padding around entity headings or category labels; shared sidebar styles own their spacing.

Uses the same 17px navigation icons, 12px horizontal / 16px bottom gutters, no gaps between items in a category, and row density as the primary sidebar. First category/field labels and entity-heading text start at an 18px top inset. Bodies use 18px top padding; the centered desktop entity-header row uses a 16px body inset to achieve that same text position. Entity headings use 19px icons matching page titles and the same 14px block gap as ordinary categories. They also reserve the space navigation rows leave below their text, so text-to-category gaps match for fine and coarse input. Category labels have no extra vertical padding. Neutral navigation icons are muted until selected, then inherit the row text color. Labels keep normal weight in both states; destructive icons retain their semantic color. Navigation destinations supply an `href`.
