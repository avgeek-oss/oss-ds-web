# Authentication emails and loading surfaces

Use `@avgeek-oss/design-system/emails/render` in the backend for `renderAuthEmail(template, data)`. It returns `{ subject, html, text }`. This dedicated entry point works in Node without Next.js, a browser, or a UI provider. Do not import email rendering from the UI root barrel.

```ts
import { renderAuthEmail } from "@avgeek-oss/design-system/emails/render";

const message = await renderAuthEmail("role-changed", {
  brand: {
    name: "Example",
    accentColor: "#2d5e44",
    theme: { accentForeground: "#ffffff" },
  },
  providerName: "authentik",
  role: "viewer",
  actionUrl: appUrl,
});
await outbox.enqueue({ to: user.email, ...message });
```

The shared templates own headings, paragraphs, action labels and the email shell. Branding is an app name, six-digit hex accent and optional public HTTP(S) logo URL. Pass the application's light theme through `brand.theme`: `surface`, `foreground`, `muted` and `accentForeground` are optional six-digit hex colors with neutral light defaults. Use `accentForeground` for the button text, independently of the email background; a yellow accent needs dark text. The brand name remains visible when remote logo images are blocked. The layout uses inline styles and email-compatible tables, a 560px container, Inter with system fallbacks, a primary action and a plain link fallback. Email colors are explicit because mail clients do not load app theme CSS. All dynamic text is escaped; URL schemes and embedded credentials are checked. Apps must additionally enforce their trusted action origin.

`AuthEmail` and `authEmailTemplates` are exported from `emails/auth-email` for previews. Sign-in is SSO only, so the templates are the two membership notices an app may send from its SCIM hooks: `role-changed` (the new role, what it allows, and that API keys and connected apps above it were revoked) and `access-removed` (sessions, keys and connected apps revoked). `providerName` names where access is managed; without it the copy says "your organisation's identity provider". A role-change without `role` does not name one. Invocation does not enable any backend feature. Optional name, team and labeled factual details supply context.

Applications own recipients, token generation and hashing, link destinations, expiry, authorization, outbox encryption, cancellation, retries and SMTP credentials. Render both alternatives before enqueueing and preserve the existing delivery constraints. Never put tokens or secrets in preview fixtures or logs. Domain notices can use `EmailShell` from `emails/email-shell` and `renderEmailMessage` from `emails/render`; their domain content remains app-owned. Do not recreate a shell or override common auth copy.

Use `LoadingSkeleton` and `SkeletonCard` from the root or `patterns/feedback/loading-skeleton` when initial loading needs visible placeholders. The group owns one accessible busy status and hides decorative cards from assistive technology. Card height and arrangement follow the eventual page; retain headings and navigation, supply meaningful height classes and prevent a false empty state. The shared card owns neutral surfaces, shimmer and reduced-motion behavior. Do not add app-owned animation or color overrides. Use the existing `Skeleton` primitive for individual text/shape placeholders, or `QueryLoading` for an invisible status when a visible skeleton would cause unnecessary layout changes. Apps retain their domain layout and query lifecycle.

First-run setup belongs to the app: the first person the identity provider makes `admin` completes `TeamSetup`. Apps must refresh cached setup state before navigating; `TeamSetup` awaits the app's mutation but does not own routing.

SMTP delivery belongs to the app. When the configured sender is a bare address, supply the application name as its display name (for example, `{ name: "Rootset", address: configuredFrom }` in Nodemailer). Preserve an explicitly configured display name. A sender name improves recognition but does not replace SPF, DKIM or DMARC authentication or guarantee inbox delivery.
