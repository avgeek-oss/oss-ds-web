# InlineExternalLink

An external text link with the one shared style: dashed underline offset 2px and a small new-tab marker.

## When to use

Use InlineExternalLink for links that leave the app, inside running text. Use `RouteLink` (through `RouteProvider`) for in-app navigation.

## What the consumer provides

`href` and the link text; optional `tooltip` (shown on hover/focus, e.g. the full URL).

## Key props

- `href` (required), `tooltip`, and any anchor attribute.
- `target` defaults to `_blank` with `rel="noopener noreferrer"` and an accessible "(opens in a new tab)" suffix; any other target omits the marker.

## Do / Don't

- Do keep the link text descriptive; the arrow marker is decorative.
- Don't restyle the underline or marker.
