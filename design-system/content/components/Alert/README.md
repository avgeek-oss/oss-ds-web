# Alert

HeroUI's inline alert with status indicator, title and description.

## When to use

Use for persistent, contextual notices such as access restrictions or upcoming expiries. Use a danger toast for submission failures, and `QueryError` for a failed load.

## What the consumer provides

`status`, and children: `Alert.Indicator`, `Alert.Content` with `Alert.Title` and `Alert.Description`.

## Key props

- `status`: `default` · `accent` · `success` · `warning` · `danger`

## Do / Don't

- Do keep the title short and the description to one sentence.
- Don't also show a failed submission inline when a toast reports it.
