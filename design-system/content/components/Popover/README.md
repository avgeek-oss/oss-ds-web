# Popover

A small non-modal surface anchored to a trigger for contextual content; the HeroUI Popover primitive.

## When to use

Use Popover for contextual detail (release notes, a short explanation). Use `Tooltip` for a one-line label, `Dropdown` for action menus, and `Modal` for forms.

## What the consumer provides

A trigger and the dialog content; open state is native unless controlled.

## Key props

- Parts: `Popover`, `Popover.Trigger`, `Popover.Content` (`placement`), `Popover.Arrow`, `Popover.Dialog`, `Popover.Heading`.

## Do / Don't

- Do keep content short and dismissible.
- Don't put a primary workflow in a popover.
