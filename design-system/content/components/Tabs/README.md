# Tabs

Switches between sibling views of one object without leaving the page; the HeroUI Tabs primitive with its native variants.

## When to use

Use Tabs for peer views of the same record (Overview, Deployments, Logs). Use the secondary sidebar (`SecondaryItems`) for navigation between pages, and `Disclosure` to reveal optional detail in place.

## What the consumer provides

Tab ids, labels and panel content; optional controlled `selectedKey` with `onSelectionChange`, or `defaultSelectedKey`.

## Key props

- Compound parts: `Tabs.ListContainer`, `Tabs.List` (needs `aria-label`), `Tabs.Tab` (`id`, `isDisabled`), `Tabs.Indicator`, `Tabs.Panel` (`id` matching its tab).
- `orientation`: `horizontal` (default) or `vertical`.

## Do / Don't

- Do put a `Tabs.Indicator` in every selectable tab.
- Don't restyle the tab list or indicator in an app; it keeps HeroUI's native styling.
