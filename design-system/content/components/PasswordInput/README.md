# PasswordInput

An `Input` with `type="password"` and a built-in Show password / Hide password toggle.

## When to use

- Every password entry: sign-in, password setup, password change and identity confirmation.
- Use `Input` for anything that is not secret.

## What the consumer provides

- All `Input` props except `type`, including `value`/`defaultValue`, `onChange`, `autoComplete`, `disabled` and an accessible name.

## Key props

- `variant`: `primary` or `secondary`. `disabled` also disables the visibility toggle.

## Do / Don't

- Do set `autoComplete` (`current-password` or `new-password`).
- Don't add a second visibility control. The toggle carries `aria-pressed` and its own label.
- New passwords use 15–1024 characters across the shared forms.
