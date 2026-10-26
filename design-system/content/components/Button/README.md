# Button

The HeroUI button, re-exported unchanged, for every in-page action; `ButtonLink` gives the same look to navigation.

## When to use

- `Button` for actions; `ButtonLink` for navigation to a route or URL.
- `AsyncActionButton` when the action awaits a request and must lock while pending.

## What the consumer provides

- `children` (the label), `onPress`, and `type="submit"` inside forms.
- `ButtonLink` takes `href` plus the same `variant` and `size`.

## Key props

- `variant`: `primary` (default), `secondary`, `tertiary`, `ghost`, `outline`, `danger`, `danger-soft`.
- `size`: `sm`, `md` (default), `lg`. Also `isDisabled`, `isPending`, `isIconOnly`, `fullWidth`.

## Do / Don't

- Do use the default primary for the main submit or page action, `secondary` for Cancel and auxiliary actions, and `danger` or `danger-soft` for destructive ones.
- Don't make Cancel a second primary button or restyle variants in app CSS.
- Icon-only buttons need an `aria-label`; icons beside text are decorative.
