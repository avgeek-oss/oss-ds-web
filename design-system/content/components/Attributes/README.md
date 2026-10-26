# Attributes

Label/value list for read-only details, as a list, card or embedded block.

**Use for** noninteractive details such as identifiers and dates. Use `ExpandableAttributeList` when rows expand, `ResourceTable` for records with actions.

**Props** `title`, `variant` list · card · embedded, `columns` 1 · 2 · 3; children `Attributes.Item` (`label`, value).

**Don't** use it for editable fields.
