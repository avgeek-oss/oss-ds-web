# Design-system artifact

This folder rebuilds the Avgeek OSS design system published on claude.ai (a Design System artifact) from this checkout: tokens, fonts, the brand book and guides, the component bundle, and one live card per component.

```sh
pnpm design-system          # writes artifacts/design-system/
pnpm design-system --check  # also renders every card in light and dark and fails on errors
```

The output is ignored by git. `artifacts/design-system/project/` mirrors the artifact's `project/` files; `uploads/` holds the marks and icons the artifact stores as uploads; `publish.json` lists the files and the index values (namespace and React libraries) the publish step sets.

## What comes from where

| Output                                                                  | Source                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tokens.json`                                                           | `tokens.mjs` names, usage notes and aliases. Color values are resolved in Chromium from the shipped stylesheet (HeroUI theme plus `src/styles/globals.css`) in both themes; other families are written as defined there. |
| `components/bundle.js`                                                  | `namespace.ts`: the root barrel and public component subpaths as one IIFE assigning `window.AvgeekOSS`, reading React from the page.                                                                                     |
| `components/bundle.css`                                                 | `styles.css` through Tailwind 4, scanning `src` and `previews`. Theme declarations that `tokens.json` defines and `@font-face` rules are removed so the artifact's tokens drive the previews.                            |
| `components/lib/*.js`                                                   | The installed React and React DOM, as classic scripts. The artifact's default React 18 cannot run this package.                                                                                                          |
| `components/index.d.ts`                                                 | The package build's declarations for each card's source module.                                                                                                                                                          |
| `components/<Name>/preview.html`                                        | `previews/<Name>.tsx`, bundled against `window.AvgeekOSS`.                                                                                                                                                               |
| `README.md`, `components/<Name>/README.md`, `assets/*/README.md`, cover | `content/`, copied as written.                                                                                                                                                                                           |
| `guides/*.md`                                                           | `docs/`, with repository-relative links reduced to their text.                                                                                                                                                           |
| `fonts/`, `uploads/`                                                    | The installed font packages, `studio/assets`, and the Hugeicons the library imports.                                                                                                                                     |

## Adding or changing a card

1. Write `previews/<ExportName>.tsx`. Line 1 is the card marker, for example `// @dsCard group="Forms" height=224`; use a group from `groupOrder` in `build.mjs` and set `height` (and `width` for wide layouts) to the rendered content. Import the library as `import * as A from "../namespace.js"` and render once with `mount` from `./mount.js`.
2. Write `content/components/<ExportName>/README.md`: a first sentence that summarizes the component, then when to use it, what the consumer provides, key props, and do/don't. State only what the source and docs support.
3. Use realistic sample data inline and inline `style` for card layout. Previews fetch nothing; Gravatar lookups in avatar patterns are the one expected miss.
4. Run `pnpm design-system --check`, then `pnpm lint` and `pnpm typecheck`, which cover this folder.

A new token goes in `tokens.mjs` with a usage note; give a color an `alias` when the source defines it as another token. Never write raw values for colors the stylesheet already resolves.

## Publishing

Publishing is a separate, explicit step; the script never uploads anything. In Claude Code, ask Claude to publish `artifacts/design-system` to the design-system artifact's URL. Following the artifact type's instructions, it:

1. reads the live `project/design-system.json` first, then sets `namespace` and `libraries` from `publish.json`, updates `lastChange`, and keeps every other key, including asset records added on the page;
2. re-uploads any changed file under `uploads/` and updates that asset's record in the index;
3. publishes the files listed in `publish.json` in one call, with the index last. `components/index.d.ts` is sent as `text/plain`.

Edits made on the artifact page are not read back into this folder. Carry wanted changes into `content/` or `tokens.mjs` before the next rebuild, or they will be overwritten.
