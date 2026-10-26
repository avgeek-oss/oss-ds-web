# ScrollShadow

HeroUI's scroll container that fades its edges to signal more content.

## When to use

Use for bounded scrolling regions such as long lists inside popovers or cards. Use pagination for record lists.

## What the consumer provides

A fixed height or width, children, and `aria-label` plus `tabIndex={0}` when the region must be keyboard scrollable.

## Key props

- `orientation`: `vertical` · `horizontal`; `size` (fade size in px); `visibility` and `isEnabled` to control the fade.

## Do / Don't

- Do make scrollable regions focusable and labelled.
- Don't nest scroll shadows.
