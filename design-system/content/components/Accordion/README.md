# Accordion

HeroUI's accordion for collapsible content sections, in default or surface variants.

## When to use

Use for general sections such as FAQs or grouped settings help. Use `ExpandableAttributeList` for label/value rows with details, and `Disclosure` for a single collapsible region.

## What the consumer provides

Compose `Accordion.Item` (`id`) → `Accordion.Heading` → `Accordion.Trigger` (with `Accordion.Indicator`) and `Accordion.Panel` → `Accordion.Body`.

## Key props

- `variant`: `default` · `surface`
- `defaultExpandedKeys` / `expandedKeys` + `onExpandedChange` for open items; `allowsMultipleExpanded`.

## Do / Don't

- Do keep trigger text short and in sentence case.
- Don't hide required form fields or primary actions in collapsed sections.
