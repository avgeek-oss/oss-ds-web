# Attributes

A label/value list for read-only details, as a titled list, a card or an embedded block.

## When to use

Use for noninteractive attributes such as weights, identifiers and dates. Use `ExpandableAttributeList` when rows reveal details, and `ResourceTable` when records need column headers or row actions.

## What the consumer provides

`title` (required unless `variant="embedded"`), children of `Attributes.Item` (`label`, value as children, optional `icon`), optional `icon` and `columns`.

## Key props

- `variant`: `list` (default) · `card` · `embedded`
- `columns`: `1` · `2` (default) · `3` (two columns below `lg`) — applies to the card layout.

## Do / Don't

- Do format values (dates, numbers) in the app before passing them.
- Don't use it for editable fields; use the form patterns.
