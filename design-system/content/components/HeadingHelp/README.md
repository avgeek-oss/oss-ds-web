# HeadingHelp

A small help icon beside a page or widget heading that opens a description and documentation link.

## When to use

Use HeadingHelp to attach documentation to a heading. Widget and page titles get it through `HeadingHelpContext`, which maps a heading title to its documentation app-wide.

## What the consumer provides

The heading `title`, and either `help` (`{ description, href, linkLabel? }`) or a `HeadingHelpContext` provider that returns documentation for a title and kind.

## Key props

- `title`, `kind` (`"page"` or `"widget"`, default widget), `help` (documentation object, or `false` to suppress).

## Do / Don't

- Do keep descriptions to one or two sentences.
- Don't use it for field-level hints; use the field `Description`.
