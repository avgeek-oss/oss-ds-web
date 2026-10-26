# ThemeSwitcher

An icon-only secondary button that toggles between light and dark themes and remembers the choice.

## When to use

Use ThemeSwitcher wherever the app offers a theme control; `ApplicationNavbar` includes it with `showThemeSwitcher`. The account Preferences page owns system/light/dark as a stored preference.

## What the consumer provides

`Providers` above it (theme context, stored under `avgeek-oss-ui-theme`). Optionally `label` (default "Appearance"), which forms the accessible name "Appearance: switch to dark theme".

## Key props

`label`, `className`, and Button props other than variant, size and press handling.

## Do / Don't

- Do mount `Providers` once at the app root.
- Don't add a visible text label next to it; the icon reflects the current theme (sun or moon).
