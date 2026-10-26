# Toast

Transient feedback stacked at the bottom center; the one place submission and mutation failures are reported.

## When to use

Use `toast.danger(...)` for a failed submission or mutation, `toast.success` / `toast.info` / `toast.warning` for optional confirmations. Load errors and access restrictions stay in their own surface.

## What the consumer provides

One `Toast.Provider placement="bottom"` mounted for the whole app, authenticated and public routes alike (`AppShell` mounts it when its policy has `toasts: true`). Messages name the action and next step: "Could not save preferences. Try again."

## Key props

- `toast.danger | success | warning | info(message, options)`; `timeout: 0` keeps a toast until dismissed.
- The close button is a 32px target; when the last toast exits, focus returns to the control that preceded it.

## Do / Don't

- Do show each failure once, as a danger toast.
- Don't also render the same failure inline in a form or modal, and don't mount a second provider.
