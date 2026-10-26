# Dropdown

An action menu anchored to a trigger; the HeroUI Dropdown primitive.

## When to use

Use Dropdown for a set of actions on an object (row actions, page overflow). Use `Select` to choose a value and `Popover` for content.

## What the consumer provides

The trigger label (or an icon with `aria-label`), the items, and `onAction(key)`.

## Key props

- Parts: `Dropdown`, `Dropdown.Trigger`, `Dropdown.Popover` (`placement`), `Dropdown.Menu` (`aria-label`, `onAction`, `selectionMode`), `Dropdown.Item` (`id`, `textValue`, `isDisabled`, `variant="danger"`).

## Do / Don't

- Do mark destructive items with `variant="danger"` and danger text, as the shared account menu does.
- Don't put form fields in a menu.
