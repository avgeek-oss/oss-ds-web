# Drawer

A panel that slides in from an edge for detail views and supplementary tasks; the HeroUI Drawer primitive with the shared dialog spacing.

## When to use

Use Drawer for detail that benefits from keeping the page visible (event details, long side forms). Use `Modal` for focused, short tasks.

## What the consumer provides

A trigger (or controlled open state), the heading and body content.

## Key props

- Parts: `Drawer` (`defaultOpen` / `isOpen`), `Drawer.Trigger`, `Drawer.Backdrop` > `Drawer.Content` (`placement`: `left`, `right`, `top`, `bottom`) > `Drawer.Dialog` > `Drawer.Header` (`Heading`, `CloseTrigger`), `Drawer.Body`, `Drawer.Footer`.

## Do / Don't

- Do use `secondary` inputs inside a drawer.
- Don't build mobile navigation from it; `AppLayout` owns the navigation drawer.
