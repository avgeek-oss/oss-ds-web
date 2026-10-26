# Table

Compound table primitive: header, rows, cells and footer.

**Use for** full control of table structure. Use `ResourceTable` for an items/columns record list.

**Props** `Table` → `ScrollContainer` → `Content` (`aria-label`) → `Header`/`Column`, `Body`/`Row`/`Cell`; optional `Footer`; `renderEmptyState`.

**Don't** restyle the native layout; right-align numeric and action columns.
