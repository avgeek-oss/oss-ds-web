# Layouts

## Shell and pages

- Use `AppShell` with `ApplicationPage` for product pages and `AuthScreen` for public auth; auth adds no page-shell padding.
- `AppShell.Content` owns 16px side gutters, no top padding and 80px bottom padding.
- `ApplicationPage` owns 20px above and below the title. Never add another top padding or gap around content.
- Page headings wrap by default. Set `titleOverflow="truncate"` to keep title and actions on one row; keep action groups compact.
- `AppLayout`'s optional `aside` docks a 26rem panel beside the page from 64rem and is a full-width right drawer below; only one drawer opens at a time.
- Auth below 640px: top-aligned, 32px vertical and 16px horizontal padding plus safe-area insets. Desktop: centered, 24px gutters.

## Navigation

- Set `activePath` when a destination is one child of a section, e.g. `href="/settings/profile"`, `activePath="/settings"`.
- Sidebar items keep HeroUI's native menu-item styles, 36px minimum height.
- The navigation toggle uses `PanelLeftIcon` at 20px inside a 44px circular button.
- Secondary sidebar: 18px vertical, 12px horizontal padding. `SecondarySection` labels are 12px medium, muted, 8px inset.
- Give `SecondaryItems` an `href` for navigation; items without one are action buttons calling `onSelect(id)`.
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

- Page-title icons 24px; secondary sidebar headings 18px; navigation, widgets, tables and controls 16px; empty states 32px.
- `text-sm` for body and labels, `text-lg leading-7 font-medium` for page titles, `text-xs` for metadata.
- Numeric widget values use `font-medium` and tabular numbers.

## Tables and widgets

- Use `ResourceTable` for record lists from items and columns; compose `Table` directly otherwise.
- Set `mobileLayout="stacked"` for a two-column detail grid below 640px; `mobileFullWidth` spans long values.
- Cells hold at most two lines: a value and optional metadata. Put chips and extra attributes in their own columns.
- Right-aligned actions need a right-aligned header. Footers are `text-xs` muted.
- Use `Widget.Action` for header and footer actions; filled buttons go in `Widget.Content`.
- Use `InlineExternalLink` for external text links: dashed underline, opens in a new tab.

## Theme

- Keep the shared surface ramp; apps set only the accent, never backgrounds, cards or overlay colors.
