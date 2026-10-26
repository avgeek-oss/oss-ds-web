# Design-system artifact

Rebuilds the Avgeek OSS design system on claude.ai from this checkout.

```sh
pnpm design-system          # writes artifacts/design-system/ (git-ignored)
pnpm design-system --check  # also renders every card in light and dark
```

## Sources

| Edit                             | To change                                     |
| -------------------------------- | --------------------------------------------- |
| `src/`, `src/styles/globals.css` | Components, bundle CSS, resolved color values |
| `tokens.mjs`                     | Token names, usage notes, aliases             |
| `previews/<Name>.tsx`            | A component's card                            |
| `content/`                       | Brand book, component guides, cover           |
| `docs/`                          | Guides                                        |

## Adding a card

1. Add `previews/<ExportName>.tsx`. Start it with `// @dsCard group="Forms" height=224`, import `* as A from "../namespace.js"`, and call `mount` once.
2. Add `content/components/<ExportName>/README.md`: a one-sentence summary, when to use it, and its key props.
3. Run `pnpm design-system --check`, `pnpm lint` and `pnpm typecheck`.

## Publishing

The script never uploads. In Claude Code, ask Claude to publish `artifacts/design-system` to the artifact URL; `publish.json` lists the files and index values.

Edits made on the artifact page are overwritten by the next publish. Copy them into `content/` or `tokens.mjs` first.
