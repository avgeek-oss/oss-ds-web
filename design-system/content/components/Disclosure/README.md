# Disclosure

Reveals optional detail in place under a full-width trigger with a trailing chevron; the HeroUI Disclosure primitive.

## When to use

Use Disclosure for one collapsible section of secondary content (advanced options, extra context). Use `Accordion` for a set of related collapsible sections, and `Tabs` for peer views.

## What the consumer provides

The heading text and body content; optional controlled `isExpanded` / `onExpandedChange`, or `defaultExpanded`.

## Key props

- Parts: `Disclosure.Heading` > `Disclosure.Trigger` (label + `Disclosure.Indicator`), `Disclosure.Content` > `Disclosure.Body`.

## Do / Don't

- Do keep the indicator inside the trigger; the shared stylesheet aligns trigger and body (trigger spans the width, body is muted and not indented).
- Don't add app padding or alignment overrides to these parts.
