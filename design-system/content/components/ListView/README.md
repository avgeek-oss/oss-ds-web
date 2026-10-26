# ListView

A navigable list of items with title and description slots and an optional empty state.

## When to use

Use for short lists of linked entities. Use `ResourceTable` when items have several columns or row actions.

## What the consumer provides

`items`, a render function `(item) => <ListView.Item>`, optional `renderEmptyState`; items use `ListView.ItemContent`, `ListView.Title`, `ListView.Description` and an optional `href`.

## Key props

- `ListView.Item href`: navigates through the route context.
- `renderEmptyState`: content shown when `items` is empty.

## Do / Don't

- Do give the list an accessible label.
- Don't pass an empty array to disguise a failed request.
