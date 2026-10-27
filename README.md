# Avgeek OSS Design System

Shared React components, application layouts, and UI patterns for Avgeek OSS apps. Towbar is the baseline for common surfaces and presentation contracts. Adapted under Apache-2.0.

## Installation

The package is public on npmjs.org. Installing it does not require a GitHub token. If an existing `.npmrc` maps `@avgeek-oss` to GitHub Packages, change that scope to `https://registry.npmjs.org` and refresh the dependency lockfile.

```sh
pnpm add @avgeek-oss/design-system react react-dom
```

The package targets React 19 and Tailwind CSS 4. Import `@avgeek-oss/design-system/styles.css` through your Tailwind build. Keep your application source scanning enabled. Fonts, HeroUI styles, tokens, and the package's component utilities are included through this stylesheet.

```tsx
"use client";

import { Providers, SignIn } from "@avgeek-oss/design-system";
import "@avgeek-oss/design-system/styles.css";

// Mount Providers once around your app. API callbacks belong to the app.
<Providers>
  <SignIn
    brand="Avgeek"
    onSubmit={signIn}
    onForgotPassword={openPasswordReset}
  />
</Providers>;
```

The root exports common layouts and patterns. Primitives also have explicit subpaths, such as `forms/input`, `pickers/date-picker`, and `data-display/table`. See the [component catalog](docs/components.md) for the available components; do not import unpublished internal paths.

## Layers

- **Primitives:** buttons, form controls, tables, widgets, charts, overlays, typography, icons, and theme controls.
- **Layouts:** application shell, primary and secondary navigation, page headings, breadcrumbs, and content sections.
- **Patterns:** separate auth screens, two-step team setup, MCP authorization, account settings, team members, resource tables, notifications, and the account menu.

Apps supply branding, routes, navigation groups, permissions, dates, and actions. API calls, authentication policy, credential ceremonies, and persistence stay in the app. Validation builders accept existing app limits; the package does not replace server authorization.

Component usage and design rules are in [DESIGN.md](DESIGN.md). The [shared pattern guide](docs/patterns.md) covers account and team management, history/filtering, notification settings, integrations, operation progress, and their application boundaries.

## Routing

Wrap the shell in `RouteProvider` with the current pathname and navigation callback. Without a router callback, links use normal browser navigation. Next.js applications can use `NextNavigationProvider` from `@avgeek-oss/design-system/adapters/next`. Next.js is an optional peer dependency and is not imported by the shared runtime.

## Development

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm storybook
pnpm verify
pnpm pack
```

Storybook runs on port 5012 with the React/Vite framework. Fixtures cover primitives, shell navigation, auth layouts, settings tables, empty states, and charts. Use the Theme toolbar for light/dark previews and responsive viewports for mobile layouts. Each component has a Master story, named examples, copyable source and API references. `Show code` includes the composition and local sample callbacks, with imports rewritten to public package subpaths; preview helpers remain unpublished. Native primitives link to HeroUI's API documentation.

Contributor rules are in [AGENTS.md](AGENTS.md). `pnpm verify` includes strict source/studio type checks, code and CSS lint, tests, clean build, Storybook export, rendered navigation, notification, toast, loading and clipboard interaction tests, and a tarball installation/type/build check outside this checkout. It saves the verified candidate and report in the ignored `artifacts/` folder. Built declarations include maps to the matching packaged source.

Browser cases live in `test/browser/*.spec.mjs` and run together through `pnpm test:browser` after `pnpm build:storybook`. The shared fixture serves that export and owns theme setup and cleanup. Use the existing command with Playwright filters to investigate a case; do not add a package script for each regression. Reports and failure screenshots stay in `artifacts/browser/`.

Release notes are in [CHANGELOG.md](CHANGELOG.md). Source and third-party attribution are in `NOTICE` and `LICENSE`.

## Publishing

Pull requests and pushes to `main` run every part of `pnpm verify` in parallel jobs, reported together as the `verify` check. Stable version tags (`v1.2.18`, for example) publish publicly to npmjs.org from the artifact that the `main` run of the tagged commit verified, after checking its integrity, instead of running the checks again. The tag must match `package.json` and point to a commit on `main`. Update the version and changelog through the normal review process, then tag the intended commit and push the tag to release it.

The publish job uses npm trusted publishing with GitHub Actions OIDC. Configure `avgeek-oss/oss-design-system` and workflow `ci.yml` in the package's npm trusted-publisher settings. The job has `id-token: write`; no publishing token is stored in GitHub secrets.

CI downloads the verified tarball, checks its SHA-512 integrity, and publishes those exact bytes without running package lifecycle scripts. A fresh registry download must match that integrity and pass the isolated Vite and Next.js consumer builds. A retry accepts an existing version only if its integrity matches the verified candidate; changed contents require a new version.

For the initial npm migration, a maintainer publishes the already verified release artifact interactively to create the package, then configures its trusted publisher. Existing GitHub Packages releases remain available for old lockfiles. Public npm installations need no registry credentials or `packages: read` permission.
