# EmptyState

A centered title, description and optional action for an empty collection or section.

## When to use

Use inside `Widget.Content` or standalone when there is nothing to show yet. `ResourceTable` already renders one from `emptyTitle`, `emptyDescription` and `emptyAction`.

## What the consumer provides

`EmptyState.Header` with `EmptyState.Title` and optional `EmptyState.Description`, optional `EmptyState.Content` for actions.

## Key props

- Standalone it renders its own Widget frame; inside a widget it uses the surrounding content panel.

## Do / Don't

- Do say what is missing and how to add it ("No API keys" · "Create an API key for your scripts or apps.").
- Don't use it for load failures; use `QueryError` or `ErrorPage`.
