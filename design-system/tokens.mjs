// Design-system token definitions: names, usage notes and the aliases between them.
// Color values not written as an alias are resolved by build.mjs from the shipped stylesheet in both themes,
// so the published values always match HeroUI plus this package's overrides.

export const colorThemes = [
  {
    id: "light",
    name: "Light",
  },
  {
    id: "dark",
    name: "Dark",
  },
];

export const colors = [
  {
    name: "accent",
    usage:
      "The one brand hue (HeroUI default blue, unchanged by the package). Primary buttons, selected states, chart range selection, code-tag highlight. Apps set their own accent; every neutral surface derives its hue from it.",
  },
  {
    name: "accent-foreground",
    alias: {
      light: "snow",
      dark: "snow",
    },
    usage:
      "Text and icons on solid `accent` fills (primary buttons). Measures 3.6:1 on `accent` in both themes — below 4.5:1 for body text; kept exact from the source, so keep labels on `accent` short and medium weight.",
  },
  {
    name: "accent-hover",
    usage:
      "Hover fill of solid `accent` buttons (accent mixed 10% toward `accent-foreground`).",
  },
  {
    name: "accent-soft",
    usage:
      "Translucent accent wash behind soft/tertiary accent controls and selected list rows (15% light, 12% dark).",
  },
  {
    name: "accent-soft-foreground",
    usage:
      "Text on `accent-soft` and accent-tinted links on `surface` (6.0:1 light, 7.9:1 dark).",
  },
  {
    name: "focus",
    alias: {
      light: "accent",
      dark: "accent",
    },
    usage:
      "Focus rings (2px solid, 4px offset on widget actions; -2px inset on list rows). 3.6:1 on `surface` light, 5.3:1 dark.",
  },
  {
    name: "background",
    usage:
      "Page ground behind the app shell, sidebar panel and auth screens. OKLCH ramp: accent hue, chroma ≤ 0.001 — L 0.982 light, 0.09 dark.",
  },
  {
    name: "surface",
    usage:
      "Cards, table rows, widget content panels, empty table cells and form-field fills on base/auth surfaces (L 0.998 light, 0.16 dark).",
  },
  {
    name: "surface-secondary",
    usage:
      "Widget frame, skeleton fill, hovered expandable rows, and the 'secondary' input surface used inside widgets, modals and drawers (L 0.958 light, 0.195 dark).",
  },
  {
    name: "surface-tertiary",
    usage:
      "Third surface level for nested panels inside secondary surfaces (L 0.935 light, 0.22 dark).",
  },
  {
    name: "surface-hover",
    usage: "Hover fill of interactive cards and rows on `surface`.",
  },
  {
    name: "overlay",
    alias: {
      light: "surface",
    },
    usage:
      "Popovers, menus, modals, drawers, tooltips and the opaque search field pinned atop picker results. Equals `surface` in light; L 0.205 in dark so overlays lift off cards.",
  },
  {
    name: "default",
    usage:
      "Neutral control fill: secondary buttons, focused list-box items in pickers, segmented track (L 0.942 light, 0.235 dark).",
  },
  {
    name: "default-hover",
    usage: "Hover fill of `default` neutral controls.",
  },
  {
    name: "default-foreground",
    alias: {
      light: "eclipse",
      dark: "snow",
    },
    usage: "Text on `default` fills (secondary/cancel buttons).",
  },
  {
    name: "segment",
    alias: {
      light: "surface",
    },
    usage:
      "Selected segment of segmented controls and tabs; `surface` in light, raised L 0.31 in dark.",
  },
  {
    name: "segment-foreground",
    alias: {
      light: "eclipse",
      dark: "foreground",
    },
    usage: "Text on `segment`.",
  },
  {
    name: "field-background",
    alias: {
      light: "surface",
      dark: "surface",
    },
    usage:
      "Text-field fill. Base and auth inputs use the native primary surface (`surface`); widget, modal and drawer inputs use the secondary variant.",
  },
  {
    name: "field-foreground",
    alias: {
      dark: "foreground",
    },
    usage: "Typed text in fields.",
  },
  {
    name: "field-placeholder",
    alias: {
      light: "muted",
      dark: "muted",
    },
    usage: "Placeholder text in fields (4.8:1 on `surface` light, 7.4:1 dark).",
  },
  {
    name: "border",
    usage:
      "Control borders and outlines (L 0.87 light, 0.285 dark). Decorative weight: 1.5:1 on `surface` light — pair with fill or text, never as the only cue.",
  },
  {
    name: "separator",
    usage:
      "Hairline dividers: sidebar edge, table rows, attribute lists, modal/section rules (L 0.91 light, 0.235 dark).",
  },
  {
    name: "foreground",
    alias: {
      light: "eclipse",
      dark: "snow",
    },
    usage:
      "Primary text and icons on `background`, `surface`, `overlay` (16.8:1 light, 20:1 dark).",
  },
  {
    name: "muted",
    usage:
      "Secondary text: descriptions, captions, table footers, widget titles, secondary menu labels, inactive icons. 4.6:1 on `background`, 4.8:1 on `surface` in light; 4.3:1 on `surface-secondary` light (widget titles there are 14px semibold — kept from the source). 7:1+ in dark.",
  },
  {
    name: "link",
    alias: {
      light: "foreground",
      dark: "foreground",
    },
    usage:
      "Inline link text; links read as `foreground` with a dashed underline rather than a hue.",
  },
  {
    name: "danger",
    usage:
      "Destructive buttons (`danger`), error text, failure counts and standalone error icons. 6.7:1 on `surface` light, 6.9:1 dark. Derived: HeroUI red mixed toward `foreground`.",
  },
  {
    name: "danger-foreground",
    alias: {
      light: "snow",
      dark: "eclipse",
    },
    usage:
      "Text on solid `danger` buttons: `snow` in light, `eclipse` in dark (the dark fill is lighter).",
  },
  {
    name: "danger-hover",
    usage: "Hover fill of solid `danger` buttons.",
  },
  {
    name: "danger-soft",
    usage:
      "Wash behind `danger-soft` buttons, danger chips and danger alerts (15%).",
  },
  {
    name: "danger-soft-foreground",
    alias: {
      light: "danger",
      dark: "danger",
    },
    usage:
      "Text on `danger-soft` — the same color as `danger`, so chips, counts and icons match.",
  },
  {
    name: "warning",
    usage:
      "Warning text, counts and standalone icons. 5.7:1 on `surface` light; amber in dark. Derived: HeroUI amber mixed toward `foreground`.",
  },
  {
    name: "warning-foreground",
    alias: {
      light: "snow",
      dark: "eclipse",
    },
    usage: "Text on solid `warning` fills.",
  },
  {
    name: "warning-soft",
    usage: "Wash behind warning chips and alerts (15% light, 12% dark).",
  },
  {
    name: "warning-soft-foreground",
    alias: {
      light: "warning",
      dark: "warning",
    },
    usage: "Text on `warning-soft`; equals `warning`.",
  },
  {
    name: "success",
    usage:
      "Success text, counts and standalone icons. 5.4:1 on `surface` light. Light `success` and `danger` sit at similar lightness, so status always carries a word or icon (StatusIndicator, Chip) — never hue alone.",
  },
  {
    name: "success-foreground",
    alias: {
      light: "snow",
      dark: "eclipse",
    },
    usage: "Text on solid `success` fills.",
  },
  {
    name: "success-soft",
    usage: "Wash behind success chips and alerts (15% light, 12% dark).",
  },
  {
    name: "success-soft-foreground",
    alias: {
      light: "success",
      dark: "success",
    },
    usage: "Text on `success-soft`; equals `success`.",
  },
  {
    name: "backdrop",
    usage:
      "Scrim behind modals, alert dialogs and the mobile navigation drawer.",
  },
  {
    name: "chart-requested",
    usage: "LineChart series for requested/total volume. Apps may override.",
  },
  {
    name: "chart-succeeded",
    usage: "LineChart series for succeeded results.",
  },
  {
    name: "chart-failed",
    usage: "LineChart series for failed results.",
  },
  {
    name: "snow",
    usage:
      "Primitive near-white; never used directly in markup — referenced by `foreground` (dark) and on-fill tokens.",
  },
  {
    name: "eclipse",
    usage:
      "Primitive near-black; referenced by `foreground` (light) and dark on-fill tokens.",
  },
];

export const typography = {
  fonts: [
    {
      family: "Inter Variable",
      file: "fonts/inter-latin-wght-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      family: "Geist Mono Variable",
      file: "fonts/geist-mono-latin-wght-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  families: {
    sans: '"Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif',
    mono: '"Geist Mono Variable", ui-monospace, monospace',
  },
  groups: [
    {
      name: "Headings",
      family: "sans",
      styles: [
        {
          name: "heading-1",
          fontSize: "36px",
          lineHeight: "40px",
          fontWeight: 600,
          usage:
            "TypographyHeading level 1 (text-4xl, semibold, tracking-tight).",
          letterSpacing: "-0.025em",
          sample: "Fleet overview",
        },
        {
          name: "error-heading",
          fontSize: "30px",
          lineHeight: "36px",
          fontWeight: 500,
          usage:
            "ErrorPage title from 640px up (text-3xl medium, tracking-tight); 24px below.",
          letterSpacing: "-0.025em",
          sample: "Page not found",
        },
        {
          name: "heading-2",
          fontSize: "24px",
          lineHeight: "32px",
          fontWeight: 500,
          usage: "TypographyHeading level 2 (text-2xl, medium).",
          letterSpacing: "-0.025em",
          sample: "Team members",
        },
        {
          name: "heading-3",
          fontSize: "24px",
          lineHeight: "32px",
          fontWeight: 600,
          usage: "TypographyHeading level 3 (text-2xl, semibold).",
          letterSpacing: "-0.025em",
          sample: "Notification destinations",
        },
        {
          name: "heading-4",
          fontSize: "20px",
          lineHeight: "28px",
          fontWeight: 600,
          usage: "TypographyHeading level 4 (text-xl, semibold).",
          letterSpacing: "-0.025em",
          sample: "API keys",
        },
        {
          name: "auth-heading",
          fontSize: "20px",
          lineHeight: "28px",
          fontWeight: 500,
          usage:
            "Auth screen headings beside the 32px BrandLockup (text-xl medium, start aligned).",
          sample: "Sign in to Avgeek",
        },
        {
          name: "heading-5",
          fontSize: "18px",
          lineHeight: "28px",
          fontWeight: 600,
          usage: "TypographyHeading level 5 (text-lg, semibold).",
          letterSpacing: "-0.025em",
          sample: "Sessions",
        },
        {
          name: "page-heading",
          fontSize: "18px",
          lineHeight: "28px",
          fontWeight: 500,
          usage:
            "ApplicationPage title: 18px / 1.75rem / 500, balanced wrapping, 20px above and below.",
          sample: "Profile",
        },
        {
          name: "heading-6",
          fontSize: "16px",
          lineHeight: "24px",
          fontWeight: 600,
          usage: "TypographyHeading level 6 (text-base, semibold).",
          letterSpacing: "-0.025em",
          sample: "Danger zone",
        },
      ],
    },
    {
      name: "Text",
      family: "sans",
      styles: [
        {
          name: "paragraph-lg",
          fontSize: "18px",
          lineHeight: "28px",
          fontWeight: 400,
          usage: "TypographyParagraph size lg for lead copy.",
        },
        {
          name: "body",
          fontSize: "16px",
          lineHeight: "24px",
          fontWeight: 400,
          usage:
            "Default paragraph and body text; also mobile text-entry inputs (16px prevents iOS zoom).",
        },
        {
          name: "body-sm",
          fontSize: "14px",
          lineHeight: "20px",
          fontWeight: 400,
          usage:
            "Default `Typography`, supporting text, table cells, selection displays and menu options on every breakpoint.",
        },
        {
          name: "label",
          fontSize: "14px",
          lineHeight: "20px",
          fontWeight: 500,
          usage: "Field labels and the TypographyText label role (medium).",
        },
        {
          name: "widget-title",
          fontSize: "14px",
          lineHeight: "20px",
          fontWeight: 600,
          usage: "Widget header titles, in `muted` on `surface-secondary`.",
        },
        {
          name: "caption",
          fontSize: "12px",
          lineHeight: "16px",
          fontWeight: 400,
          usage:
            "Captions, table footers, widget actions and legends, timestamps — in `muted`.",
        },
        {
          name: "secondary-label",
          fontSize: "12px",
          lineHeight: "16px",
          fontWeight: 500,
          usage:
            "Compact field labels inside secondary menus/sections, `muted`, 8px start inset.",
        },
      ],
    },
    {
      name: "Code",
      family: "mono",
      styles: [
        {
          name: "code",
          fontSize: "14px",
          lineHeight: "20px",
          fontWeight: 400,
          usage:
            "Inline `TypographyCode` (on `default-soft`, radius-md, 4px inline padding) and CodeBlock.",
          sample: "pnpm add @avgeek-oss/design-system",
        },
      ],
    },
  ],
};

export const spacing = {
  note: "Tailwind 4 spacing: one step = 0.25rem (4px). Names follow the Tailwind multiplier.",
  tokens: [
    {
      name: "space-0.5",
      value: "2px",
      usage: "Gap between a widget's content panel and its footer.",
    },
    {
      name: "space-1",
      value: "4px",
      usage: "Mobile resource-table label gap; inline code padding.",
    },
    {
      name: "space-1.5",
      value: "6px",
      usage:
        "Widget content inset from the widget frame; legend dot-to-label gap.",
    },
    {
      name: "space-2",
      value: "8px",
      usage:
        "Picker popover inset (adds to field radius), alert gap, secondary-menu label inset.",
    },
    {
      name: "space-3",
      value: "12px",
      usage:
        "Modal/drawer header column gap, widget header and footer gaps, legend gaps.",
    },
    {
      name: "space-4",
      value: "16px",
      usage:
        "content-grid gap between sibling cards, sections and fields on both axes; AppShell.Content horizontal gutters; widget content padding; header→body→footer spacing in dialogs; mobile auth horizontal padding.",
    },
    {
      name: "space-5",
      value: "20px",
      usage:
        "Modal, alert-dialog and drawer padding; ApplicationPage space above and below the title.",
    },
    {
      name: "space-6",
      value: "24px",
      usage: "Desktop auth frame horizontal gutters.",
    },
    {
      name: "space-8",
      value: "32px",
      usage:
        "Gap between auth heading block and form; mobile auth vertical padding.",
    },
    {
      name: "space-20",
      value: "80px",
      usage: "AppShell.Content bottom padding.",
    },
  ],
};

export const radius = {
  note: "HeroUI scale off --radius 0.5rem.",
  tokens: [
    {
      name: "radius-xs",
      value: "2px",
      usage: "Hairline marks and small indicators (radius × 0.25).",
    },
    {
      name: "radius-sm",
      value: "4px",
      usage: "Widget action focus box (radius × 0.5).",
    },
    {
      name: "radius-md",
      value: "6px",
      usage: "Inline code, small chips and tags (radius × 0.75).",
    },
    {
      name: "radius",
      value: "8px",
      usage:
        "Base radius: list rows' focus outline, menu items, the 32px brand mark tile.",
    },
    {
      name: "field-radius",
      value: "12px",
      usage:
        "Text fields, selects, buttons (radius × 1.5); also `rounded-xl` widget content panels.",
    },
    {
      name: "radius-2xl",
      value: "16px",
      usage: "Widget frame (`rounded-2xl`), cards.",
    },
    {
      name: "picker-popover-radius",
      value: "20px",
      usage:
        "Select, ComboBox and Autocomplete popovers: field radius + the 8px inset.",
    },
    {
      name: "radius-3xl",
      value: "24px",
      usage: "Large sheets and modals (radius × 3).",
    },
    {
      name: "radius-4xl",
      value: "32px",
      usage: "Largest rounded containers (radius × 4).",
    },
  ],
};

export const shadow = {
  note: "Dark mode drops surface and field shadows; overlays get a 1px inner highlight.",
  tokens: [
    {
      name: "surface-shadow",
      value: {
        light:
          "0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.06), 0 0 1px 0 rgba(0, 0, 0, 0.06)",
        dark: "0 0 0 0 #00000000 inset",
      },
      usage: "Cards and surface components.",
    },
    {
      name: "overlay-shadow",
      value: {
        light:
          "0 2px 8px 0 rgba(0, 0, 0, 0.06), 0 -6px 12px 0 rgba(0, 0, 0, 0.03), 0 14px 28px 0 rgba(0, 0, 0, 0.08)",
        dark: "0 0 1px 0 rgba(255, 255, 255, 0.3) inset",
      },
      usage: "Popovers, menus, modals, toasts.",
    },
    {
      name: "field-shadow",
      value: {
        light:
          "0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.06), 0 0 1px 0 rgba(0, 0, 0, 0.06)",
        dark: "0 0 0 0 #00000000 inset",
      },
      usage: "Form fields (borderless by default: `field-border-width` 0).",
    },
    {
      name: "widget-content-shadow",
      value: "0 0 0 1px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.04)",
      usage:
        "Inner content panel of a Widget, on `surface` inside the `surface-secondary` frame.",
    },
  ],
};

export const layout = {
  note: "Fixed shell dimensions from the layout CSS.",
  tokens: [
    {
      name: "sidebar-width",
      value: "15rem",
      usage: "Desktop AppShell sidebar panel (≥ 64rem viewport).",
    },
    {
      name: "drawer-width",
      value: "18rem",
      usage: "Mobile navigation drawer.",
    },
    {
      name: "secondary-drawer-width",
      value: "28rem",
      usage:
        "Mobile drawer with secondary navigation (capped at 100vw − 1rem).",
    },
    {
      name: "workspace-page-content-width",
      value: "80rem",
      usage: "Max width of workspace page content.",
    },
    {
      name: "brand-mark-size",
      value: "32px",
      usage: "BrandLockup mark on auth screens and in the sidebar.",
    },
  ],
};

export const border = {
  note: "Stroke widths.",
  tokens: [
    {
      name: "border-width",
      value: "1px",
      usage: "Control borders and separators.",
    },
    {
      name: "field-border-width",
      value: "0px",
      usage:
        "Fields are borderless by default; they rely on fill and `field-shadow`.",
    },
    {
      name: "ring-offset-width",
      value: "2px",
      usage: "Focus ring offset on primitives.",
    },
  ],
};

export const opacity = {
  tokens: [
    {
      name: "disabled-opacity",
      value: "0.5",
      usage: "Disabled controls and widget actions.",
    },
  ],
};
