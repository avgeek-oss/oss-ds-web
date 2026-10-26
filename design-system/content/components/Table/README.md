# Table

The HeroUI table primitive for direct compound composition of header, rows, cells and footer.

## When to use

Use when you need full control over table structure. Use `ResourceTable` for an items/columns record list with row links, actions and an empty state.

## What the consumer provides

Compose `Table` → `Table.ScrollContainer` → `Table.Content` (with `aria-label`) → `Table.Header`/`Table.Column` and `Table.Body`/`Table.Row`/`Table.Cell`; optional `Table.Footer`.

## Key props

- `Table.Column isRowHeader` marks the meaningful row header when it is not the first column.
- `Table.Body renderEmptyState` renders one muted row on `surface`.
- `Table.Footer` renders `caption` text in `muted`.

## Do / Don't

- Do right-align numeric and action columns together with their headers, using tabular numerals.
- Do keep cells to at most two lines: a primary value and optional secondary text.
- Don't restyle the native table layout; base Table layout stays native.
