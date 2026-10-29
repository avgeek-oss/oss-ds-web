# Emails and loading

## Auth emails

- Render in the backend with `renderAuthEmail(template, data)` from `emails/render`; it returns `{ subject, html, text }`.
- Templates own headings, copy, action labels and the shell. Don't recreate the shell or override auth copy.
- Brand with an app name, six-digit hex accent and optional public logo URL; pass light colors through `brand.theme`.
- Set `accentForeground` for button text; a yellow accent needs dark text.
- Layout: 560px container, Inter with system fallbacks, a primary action and a plain link fallback.
- Templates: `role-changed` and `access-removed`, naming the provider through `providerName`.
- Apps own recipients, tokens, expiry, delivery and SMTP. Never put tokens in previews or logs.
- Domain notices may use `EmailShell` with `renderEmailMessage`.

## Loading

- Use `LoadingSkeleton` and `SkeletonCard` for visible initial-loading placeholders shaped like the eventual page.
- Keep headings and navigation while loading; never show a false empty state.
- Use `Skeleton` for single text or shape placeholders, `QueryLoading` for an invisible status.
- Don't add app-owned animation or color overrides.
