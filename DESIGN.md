# Design rules

Towbar is the baseline for shared application layouts, features, and presentation contracts. Base HeroUI primitives use the library’s default styling and native variant, color, and size APIs. App layouts and composed patterns carry their own structure. Apps own authorization, persistence, and data fetching.

- [Layouts](docs/layouts.md): page spacing, navigation, overlays, headings.
- [Forms and feedback](docs/forms.md): surface variants, validation, pending states, notifications.
- [Shared application patterns](docs/patterns.md): typed data, callbacks, and application boundaries.
- [Component catalog](docs/components.md): primitive source files and Storybook entries.
- [Contributor rules](AGENTS.md): component ownership, APIs, lint, styles, and validation.

Use semantic tokens such as `background`, `surface`, `surface-secondary`, `foreground`, `muted`, `accent`, `danger`, and `separator`. Do not introduce raw colors in application components. Chart series use `--chart-requested`, `--chart-failed`, and `--chart-succeeded`; applications can override these semantic tokens.

Load `styles.css` through Tailwind and use the exported components. If a component is missing, add it here with an interactive Storybook fixture before copying styles into an app.

Base primitives retain HeroUI's variants, colors and behavior. Shared CSS corrections are limited to reviewed table metadata/empty content, disclosure alignment, alert spacing, overlay padding/header alignment, accessible toast dismissal, scoped breadcrumb popover motion, notification trigger press geometry, and ListBox indicator spacing, as documented in the topic files. Do not add unrelated global primitive overrides. New styling needs a reviewed application requirement and a scope in the relevant pattern or an explicit opt-in variant. Storybook fixtures may arrange examples without restyling their controls. Widget, Field and LineChart own their styles; ResourceTable composes Table for record lists and owns its opt-in stacked mobile detail layout; base Table layout remains native.

The shared ListBox tick reservation is a layout correction: picker popover padding must not overlap the selection indicator. It applies to all rows with an indicator; native colors, sizing and selection behavior remain in place.

Tables own their frame and render directly in page content. Never put `Table`, `ResourceTable`, `HistoryTable` or another table pattern inside `Widget`. Use widgets for forms and metrics; place table counts in the page heading or the table's own footer.

Chip labels stay on one line, including multiword labels and labels with icons. Their shared white-space and word-breaking rules prevent inherited table/content styles from splitting a label. Containers reserve the chip's intrinsic width; do not override this contract in an app.

Sidebar field labels use the compact muted hierarchy described in the layout guide. Workspace selection uses the same Select presentation as sidebar filters, with Workspace as its field label. Select, ComboBox and Autocomplete popovers derive their outer radius from the field radius plus the 8px inset. These corrections belong to the shared stylesheet; consumers do not restyle individual labels or picker corners.

Selection displays and menu options remain 14px on mobile and desktop. Only actual text-entry controls retain the larger 16px mobile text, including search fields and editable ComboBox inputs. Preserve native control heights; use the typography contract in the forms guide.

Semantic danger, warning and success tokens use the same foreground as their soft chips. Status counts, standalone icons and text must use these tokens; chip icons inherit their chip foreground. Theme-specific solid foregrounds preserve contrast. Profile details combines the avatar and name form; preferences omit previews and explanatory footers. Searchable picker results scroll below a fixed, opaque search field.

Backgrounds, cards, inputs, popovers and neutral controls use one shared OKLCH ramp. The hue comes from `--accent`; chroma stays at or below 0.001 so large surfaces look neutral. Dark page lightness is 0.09, with raised surfaces between 0.16 and 0.235. Light pages use 0.982 and cards 0.998. Apps set their accent, not separate surface/background ramps. Preserve surface contrast and verify both themes when changing these tokens.

Route-level failures use the shared `ErrorPage` pattern for 404, 500, unavailable and forbidden states. Recovery actions and destinations belong to the app; avoid app-specific error cards or raw exception details. See [patterns](docs/patterns.md#error-pages).
