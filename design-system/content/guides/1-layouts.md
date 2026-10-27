# Layouts

## Shell and pages

- Use `AppShell` with `ApplicationPage` for product pages and `AuthScreen` for public auth; auth adds no page-shell padding.
- `AppShell.Content` owns 16px side gutters, no top padding and 16px bottom padding.
- `ApplicationPage`, `ContentPage` and `StatusPage` own 16px above and below the title. Never add another top padding or gap around content.
- Page headings wrap by default. Set `titleOverflow="truncate"` to keep title and actions on one row; keep action groups compact.
- `AppLayout`'s optional `aside` docks a 26rem panel beside the page from 64rem and is a full-width right drawer below; only one drawer opens at a time.
- Auth below 640px: top-aligned, 32px vertical and 16px horizontal padding plus safe-area insets. Desktop: centered, 24px gutters.

## Navigation

- Set `activePath` when a destination is one child of a section, e.g. `href="/settings/profile"`, `activePath="/settings"`.
- Sidebar items share 17px icons and native menu hover/focus states; neutral icons are muted until selected, then use the text color. Selected labels keep normal weight; destructive icons keep their semantic color; minimum height is 36px for fine input and 44px for coarse input.
- Sidebar bodies and footer action groups use 18px top, 16px bottom and 12px horizontal padding, with 14px gaps between blocks and no gaps between navigation items. On desktop, a body with an entity header uses 16px top padding: the centered 28px text in its 32px row starts at 18px, matching category/field labels. Mobile bodies use 18px top padding throughout. Entity headers reserve the same space below their text as navigation rows, keeping the text-to-category gaps equal for fine and coarse input. Category labels have no extra vertical padding. Add workspace selection through `SidebarConfig.workspace` and `WorkspaceSelector`; its native Select uses Workspace as a field label, text-only choices, and a plus icon for Create Workspace.
- Header and drawer navigation toggles use a 17px foreground `PanelLeftIcon`, matching header actions at 40px below 768px and 36px above. Coarse-input targets extend to 44px. Hover clears on activation. The header icon aligns with the sidebar icon column.
- Secondary sidebar: align the first category/field label and entity-heading text at 18px below the divider; use the desktop row compensation above. Field labels in both sidebars are 12px medium, muted, 8px inset.
- Give `SecondaryItems` an `href` for navigation; items without one are action buttons calling `onSelect(id)`.
- Sidebar categories can also use `SecondarySection` with filter fields, sorting, switches and actions. Keep native form spacing between controls; keep navigation lists gapless. See `Layouts / Shell / Filters` in Storybook.
- Account settings use `Account Settings / <page>` at `/settings/<page>`; team settings use `Team Settings / <page>` at `/team-settings/<page>`.

## Breadcrumbs

- Use `BreadcrumbTrail`. Only the final item is current: medium foreground text. Ancestors are regular muted text.
- Ancestors are navigable pages, never sidebar categories like Operate or Settings. Top-level pages pass `breadcrumbAncestors={[]}`.
- Put `BreadcrumbDropdown` or `BreadcrumbSelect` in an item's `content` for entity menus. No underlines on links or triggers.

## Overlays

- `Modal` for forms and confirmations, `Popover` for contextual content, `Dropdown` for action menus.
- Dialogs pad 20px, 16px between header and body and before the footer. Keep the close control in the header.
- Omit unused body or footer sections.

## Icons and type

- Page-title and secondary sidebar heading icons 19px; navigation 17px; widgets, tables and controls 16px; empty states 32px.
- `text-sm` for body and labels, `text-lg leading-7 font-medium` for page titles, `text-xs` for metadata.
- Numeric widget values use `font-medium` and tabular numbers.

## Tables and widgets

- Use `ResourceTable` for record lists from items and columns; compose `Table` directly otherwise.
- Render tables directly in page content. Never put a table or table pattern inside `Widget`; tables own their frame. Put counts in the page heading or table footer.
- Set `mobileLayout="stacked"` for a two-column detail grid below 640px; `mobileFullWidth` spans long values.
- Cells hold at most two lines: a value and optional metadata. Put chips and extra attributes in their own columns.
- Right-aligned actions need a right-aligned header. Footers are `text-xs` muted.
- Use `Widget.Action` for header and footer actions; filled buttons go in `Widget.Content`.
- Use `InlineExternalLink` for external text links: dashed underline, opens in a new tab.

## Theme

- Keep the shared surface ramp; apps set only the accent, never backgrounds, cards or overlay colors.
