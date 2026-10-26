# ListView

A navigable list of items with title and description slots.

**Use for** short lists of linked entities. Use `ResourceTable` for several columns or row actions.

**Provide** `items`, a render function returning `ListView.Item` (optional `href`), and `renderEmptyState`.

**Don't** pass an empty array to hide a failed request.
