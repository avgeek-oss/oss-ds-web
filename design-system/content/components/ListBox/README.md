# ListBox

The HeroUI selectable list used inside pickers, and on its own for an inline single or multiple selection.

## When to use

- Inside `Select`, `ComboBox` and `Autocomplete` popovers, or as a standalone inline list. Use `Dropdown` for action menus.

## What the consumer provides

- `ListBox.Item` children with `id`, `textValue` and a trailing `ListBox.ItemIndicator`. Optional `ListBox.Section` and `Header`.
- `selectionMode`, `selectedKeys`/`defaultSelectedKeys`, `disabledKeys`, `onSelectionChange`, and an `aria-label` when standalone.

## Key props

- `selectionMode`: `single` or `multiple`. `variant` as in HeroUI.

## Do / Don't

- Do wrap rich content in a shrinking `min-w-0 flex-1` container, truncate the label and keep metadata `shrink-0`.
- Don't place metadata over the indicator. Rows reserve 32px at the inline end for the tick.
