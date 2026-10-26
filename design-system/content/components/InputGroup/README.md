# InputGroup

The HeroUI input with attached prefix and suffix slots, for fixed text, units, icons or shortcuts around the typed value.

## When to use

- A URL scheme, unit or keyboard hint that belongs to the field. Use a plain `Input` when there is nothing to attach.

## What the consumer provides

- Compound parts: `InputGroup.Prefix`, `InputGroup.Input` (with the input attributes and an accessible name), `InputGroup.Suffix`.

## Key props

- `variant`: `primary` (default) or `secondary`. `fullWidth`.

## Do / Don't

- Do keep prefix and suffix content short and non-interactive, or give interactive content its own label.
- Don't recreate the group with absolutely positioned elements around an `Input`.
