# Autocomplete

A HeroUI searchable picker: a select-style trigger opening a popover with a `SearchField` pinned above the filtered `ListBox`.

## When to use

- Choosing one item from a list too long to scan, such as members or time zones. Use `Select` for short lists, and `ComboBox` when the input itself should be editable.

## What the consumer provides

- Compound parts: a `Label` and `Autocomplete.Trigger` (`Autocomplete.Value`, `Autocomplete.Indicator`). Then `Autocomplete.Popover` with `Autocomplete.Filter` (a `filter(text, search)` function) wrapping a `SearchField` (secondary, with `aria-label`) and a `ListBox`.
- `selectedKey`/`defaultSelectedKey` and `onSelectionChange`.

## Key props

- `variant`: `primary` (default) or `secondary`. `isDisabled`, `isRequired`.

## Do / Don't

- Do use `variant="secondary"` for the nested `SearchField`. It stays opaque and fixed while results scroll beneath it.
- Don't add your own popover radius or padding.
