# BrandLockup

An app's mark and name side by side: a 32px logo slot and the name in medium text, truncating when space runs out.

## When to use

Use BrandLockup on auth screens (left-aligned with the form) and anywhere the app identifies itself. The sidebar and navbar render the brand from their `config`.

## What the consumer provides

`logo` (a 32px mark; the app's own asset, swapped for dark mode if it has one) and the app name as children.

## Key props

`logo`, `children`, plus span attributes (`className`, `style`, ref).

## Do / Don't

- Do use a 32px mark with an 8px corner.
- Don't override the lockup's alignment or text style in an app.

The preview uses a plain accent tile in place of an app logo.
