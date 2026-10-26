# Pagination

Previous / Next with bounded page numbers, for known or cursor-style totals.

**Use for** custom lists that load page by page; `ResourceTable` and the settings tables already include it.

**Props** `page`, `totalPages` (`null` for cursors, with `hasNextPage`), `onPageChange(page)`.

**Don't** guess a total for cursor pagination, or mix managed props with native children.
