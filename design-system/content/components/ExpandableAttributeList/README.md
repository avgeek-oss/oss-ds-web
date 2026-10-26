# ExpandableAttributeList

An attribute list whose rows can expand to reveal details.

**Use for** timelines where some rows carry details. Use `Attributes` when every row is static, `ResourceTable` for records with actions.

**Provide** `title`; `ExpandableAttributeList.Item` with `label`, `value` and details as children; `defaultExpanded` or `isExpanded` + `onExpandedChange`.

**Don't** format dates or load data in the list; the app supplies them.
