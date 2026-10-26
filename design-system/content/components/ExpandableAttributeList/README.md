# ExpandableAttributeList

An attribute list whose rows can expand to reveal details, sharing the Attributes frame, row spacing and dividers.

## When to use

Use for activity or event timelines where some rows carry details. Use `Attributes variant="list"` when every row is static, `ResourceTable` for records with headers or row actions, and `Accordion` for general sections.

## What the consumer provides

`title`, optional `icon` and `footer`; children of `ExpandableAttributeList.Item` with `label`, `value`, optional `leadingContent` (for example a formatted time), decorative `icon`, and details as children.

## Key props

- `Item` expansion: uncontrolled `defaultExpanded`, or controlled `isExpanded` + `onExpandedChange`.
- Rows without children render static but keep the chevron column so values stay aligned.

## Do / Don't

- Do supply formatted dates and values, pagination and empty/loading/error content from the app.
- Do use `Attributes variant="embedded"` for details inside an item.
