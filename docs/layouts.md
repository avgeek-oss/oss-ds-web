# Layouts

## Application shell

Use `AppShell` and `ApplicationPage` for product pages. Use `AuthScreen` for public authentication; it has a different layout and does not add page-shell padding.

Below 640px, the shared auth frame starts at the top with 32px vertical and 16px horizontal padding, plus device safe-area insets at the top and bottom. This applies to all auth screens. Desktop auth frames retain their centered layout and 24px horizontal gutters.

`AppShell.Content` owns 16px horizontal gutters, no top padding, and 16px bottom padding. `ApplicationPage` owns 16px above and below the page title; `ContentPage` and `StatusPage` share that spacing. Do not add another top padding or gap around the content: it doubles the heading-to-content spacing.

```tsx
<AppShell.Content>
  <ApplicationPage title="Profile" breadcrumbAncestors={ancestors}>
    <NameSettingsForm title="Profile details" value={name} onSave={save} />
  </ApplicationPage>
</AppShell.Content>
```

Do not put a `pt-4` wrapper around `NameSettingsForm` in this example.

Page headings wrap by default. Set `titleOverflow="truncate"` on `ApplicationPage`, `ContentPage`, or `StatusPage` when the title and actions must remain on one row. The title area shrinks while actions retain their width; plain titles use `TooltipText` to reveal clipped text on hover, focus, or press. A custom `titleContent` keeps its own icon and text composition: give its text `min-w-0 truncate` and use `TooltipText` for the full title. Keep action groups compact enough to fit the narrowest supported screen; this option does not hide actions.

Set a navigation item's `activePath` when its destination is one child of a section, for example `href="/settings/profile"` with `activePath="/settings"`. Matching respects path boundaries. The default matches the destination and its descendants.

Matching internal primary links expose `aria-current="page"` using the same rule as their visual selection. Account and Team descendants retain their owning section; similar prefixes such as `/settings-archive` and `/teams` do not match. `preserveSubroute` keeps the current child route when its owning primary link is activated. External links do not expose a current-page state.

`AppLayout` accepts an optional right-hand `aside`, used by the [agent chat](patterns.md#agent-chat). From 64rem it is a docked 26rem column beside the page, and the page narrows instead of being covered. Override the width with `--app-layout-aside-width`. Below 64rem it is a full-width right drawer. Only one drawer is open on small screens: opening the aside closes navigation, and opening navigation closes the aside. Control it with `asideOpen` and `onAsideOpenChange`, and name it with `asideLabel`. When the desktop aside closes with focus inside, focus returns to the control marked `data-app-aside-trigger`, which `AgentChatTrigger` sets.

The shared navigation toggle uses the same arrow-free `PanelLeftIcon` when the menu is open or closed. Header and drawer controls use 17px foreground icons and match the notification and appearance buttons: 40px below 768px and 36px at wider viewports. Coarse-input targets extend invisibly to at least 44px. Their circular hover surfaces stay within the visible button size and clear on activation, before sidebar motion starts. A fresh pointer hover restores the highlight. The header icon aligns with the sidebar icon column, 20px from the column edge (12px gutter plus 8px row inset); the button is centered around that icon. Both toggle states retain their accessible name and expanded state.

Primary and secondary sidebar items share 17px icons, 12px icon-to-label gaps, and 6px vertical / 8px horizontal row padding. Rows have a 36px minimum height for fine input and 44px for coarse input. Neutral icons use the muted color by default and inherit the row text color when selected. Labels keep normal weight in both states; selection uses the row background and icon color. Destructive icons retain their semantic color. Rows retain HeroUI’s native menu-item hover and focus states. Sidebar destinations remain navigation links.

Sidebar bodies use 18px top, 16px bottom and 12px horizontal padding, with safe-area padding in the mobile secondary pane. Footer action groups use those same gutters. On desktop, a body with an entity header uses 16px top padding: its 32px row centers a 28px text line, so the heading text starts 18px below the divider, matching the first category or field label in a headerless sidebar. Mobile bodies use 18px top padding with or without an entity header. Blocks use a 14px gap. Entity headers also reserve the space that navigation rows leave below their text, so heading-to-category and row-to-category text gaps match on desktop and mobile, including coarse input. Category labels have an 8px horizontal inset and no vertical padding. Sections have 4px from their heading to the row list and no gap between rows. Apps must not restyle shell internals or set local navigation density.

Put `WorkspaceSelector` in `SidebarConfig.workspace`. It renders in normal flow before the primary groups, using the same secondary-variant `Select` as sidebar filters. Workspace is the field label, not a category heading. Native select spacing, shape, foreground text and trailing indicator match the filter controls. Supply `items`, `selectedKey`, `onSelectionChange`, and optional `onCreate` and `isDisabled`. Workspace selection, creation, permissions and persistence remain app-owned. Choices have no leading icons; Create Workspace has a plus icon and calls `onCreate` without changing the current selection. Do not add workspace icons or position the selector over the sidebar with app CSS.

```tsx
<ApplicationSidebar
  config={{
    ...sidebar,
    workspace: (
      <WorkspaceSelector
        items={workspaces}
        selectedKey={workspace.id}
        onSelectionChange={switchWorkspace}
        onCreate={openCreateWorkspace}
      />
    ),
  }}
/>
```

Set `SidebarConfig.brandUpdateVersion` to show a 6px yellow dot immediately after the current version, using `--version-update-indicator`. Keep the usual brand layout; do not add visible update text or force an extra line. Supply `brandUpdateHref` with the app's update-management page to make the version and dot a navigation link; the brand title continues to use `homeHref`. Without an update destination, the indicator is informational. Both forms expose the available version through an accessible label and hover hint. Update links retain ordinary keyboard and modified-click navigation and close mobile navigation after activation.

The secondary sidebar aligns its first category/field label or entity-heading text at an 18px top inset. Use 18px body top padding except for the centered desktop entity-header row described above; bottom padding stays 16px and horizontal padding stays 12px.

Sidebar field labels use 12px medium, muted text with an 8px inline-start inset. This applies to shared `Label` and native field labels in either sidebar, including `SecondarySection`s portaled into the mobile navigation drawer and the primary workspace field. Use `ChoiceField`, `HistoryFilter`, or the native picker parts without app-specific label classes. Labels outside sidebars retain their normal form hierarchy.

Categories can mix `SecondaryItems` navigation with arbitrary controls in `SecondarySection`. Group related fields with their native form spacing; destination rows have no gap between them. `Layouts / Shell / Filters` in Storybook shows status and searchable assignee filters, sorting, a switch and reset action updating a task table. Filter state lives above the mobile drawer, so closing and reopening it keeps the chosen values.

Import `SecondaryItems` from `@avgeek-oss/design-system/navigation/secondary-sidebar`. Give navigation items an `href`; they render `RouteLink`, use the app's `RouteProvider`, retain modified/new-tab clicks, and close the mobile drawer only on ordinary activation. `selected` marks the current link with `aria-current="page"`. An item without `href` remains an action button and calls `onSelect(id)` before closing; `onSelect` can be omitted for link-only lists. A disabled item remains a disabled button without a navigable destination, including when it has an `href`. Existing action lists retain their behavior and density.

The account menu uses labeled Account, product, and Session sections with dividers spanning the full popover width. Padding belongs inside each section, so the dividers meet both edges while labels and items remain inset. The identity header remains visually separate from the menu. The SidebarAccountMenu Storybook fixture previews this shared component directly.

### Breadcrumbs

Use `BreadcrumbTrail` for links and current-page labels. Only the final visible item represents the current page and uses medium foreground text. Breadcrumb ancestors represent navigable pages, never primary-sidebar categories such as Dashboard, Operate, Monitor, Stats or Settings. Supply an `href` for an ancestor link or interactive `content` for an entity navigation dropdown; plain non-linked ancestors are omitted. Top-level pages pass `breadcrumbAncestors={[]}` and show only their current-page label. Every retained ancestor uses regular muted text, whether it is a link or a dropdown trigger. Hover, focus and opening a menu do not give an ancestor current-page emphasis; keyboard focus retains its visible outline. Apps supply the hierarchy in route order instead of assigning active styles themselves. Place `BreadcrumbDropdown.Root` or `BreadcrumbSelect.Root` in an item's `content` for navigation menus or searchable entity selectors. Breadcrumb links and triggers stay free of underlines, including on hover and focus. Both retain HeroUI's compound parts and keyboard behavior; their compact triggers inherit the current item's emphasis and show a chevron. Menus render in a portal outside the breadcrumb's truncation area. Breadcrumb popovers use an opacity-only 120ms opening fade and 80ms closing fade, keeping their geometry and pressed rows steady. Reduced motion disables the fade. Their native compound parts, refs, controlled state, keyboard navigation, and focus return remain available; reopening a retained closing popover restores focus inside its active scope without remounting it. Ordinary `Dropdown` and `Select` keep native motion.

```tsx
<BreadcrumbTrail
  items={[
    {
      label: "Account",
      content: (
        <BreadcrumbDropdown.Root>
          <BreadcrumbDropdown.Trigger>Account</BreadcrumbDropdown.Trigger>
          <BreadcrumbDropdown.Popover placement="bottom start">
            <BreadcrumbDropdown.Menu aria-label="Account pages">
              <BreadcrumbDropdown.Item id="profile" href="/settings/profile">
                Profile
              </BreadcrumbDropdown.Item>
              <BreadcrumbDropdown.Item
                id="preferences"
                href="/settings/preferences"
              >
                Preferences
              </BreadcrumbDropdown.Item>
            </BreadcrumbDropdown.Menu>
          </BreadcrumbDropdown.Popover>
        </BreadcrumbDropdown.Root>
      ),
    },
    { label: "Profile" },
  ]}
/>
```

For an entity selector, use `BreadcrumbSelect.Trigger`, `BreadcrumbSelect.Value`, and `BreadcrumbSelect.Popover` with `ListBox`; compose `Autocomplete.Filter` and `SearchField` when search is needed. Applications own the options, loading state and navigation.

Mobile drawers retain the outgoing sidebar through dismissal. After exit, native focus restoration runs first. If focus remains on the document body because navigation replaced the original opener, AppLayout restores focus to the current `.navigation-toggle` button. It preserves deliberate destination focus, skips disabled or inert controls, and cancels the fallback if the drawer reopens. `useMobileNavigation().isRestoringFocus` is true during mobile dismissal and until the native restoration frame completes. Defer app-owned destination autofocus while it is true, then move focus only if the document is active and focus is still on its body. This prevents a newly mounted heading from competing with native restoration; it does not authorize replacing deliberate destination focus. The signal defaults to false outside `AppLayout`, stays false on desktop, and resets if navigation reopens. Apps do not need a focus timer; `onSidebarOpenChange` continues to report state changes at dismissal start. Test transitions between pages with and without secondary navigation, Escape dismissal, focus return, and reopening. Controls use HeroUI’s native interaction feedback.

## Modals

Use `Modal` for forms and confirmation flows; use `Popover` for contextual content and `Dropdown` for action menus.

Modals, alert dialogs and drawers use 20px dialog padding, a 16px gap between the header and body, and 16px before the footer. The heading and close control share a grid row; long headings wrap within the space beside the close control. Omit unused body/footer sections to prevent empty spacing.

```tsx
<Modal.Dialog>
  <Modal.Header>
    <Modal.Heading>Create invitation</Modal.Heading>
    <Modal.CloseTrigger />
  </Modal.Header>
  <Modal.Body>{fields}</Modal.Body>
  <Modal.Footer>{actions}</Modal.Footer>
</Modal.Dialog>
```

Keep the close control inside the header for title alignment. HeroUI's scrolling, focus management, dismissal and surface styles remain unchanged.

## Typography and tables

Use 19px decorative icons beside page titles, including custom `titleContent`, matching secondary sidebar entity headings. Navigation rows use 17px icons. Use `SettingsPageTitle` for common account and team settings headings. Reserve that size in a non-shrinking icon wrapper; scope SVG sizing to the leading icon so nearby 16px help icons keep their size. Widget titles, table cells and ordinary controls use 16px icons; compact buttons retain their native 14px icon sizing. Metric icons beside `text-lg` values may use 20px. Empty-state illustrations use 32px. Keep the icon library's default stroke width and avoid global SVG size overrides.

Use `text-sm` for body text and labels, `text-lg leading-7 font-medium` for page titles and desktop secondary sidebar headings, and `text-xs` for descriptions and metadata. Both desktop headings center their text in a 32px row with a 16px outer top inset; their centered 28px text lines start at 18px, matching the first sidebar category/field label. Page titles have 16px below; secondary sidebar headings use the normal 14px block gap plus the same space below their text as a navigation row. The sidebar body owns this alignment; do not compensate with category-label padding. Numeric widget values use `font-medium` and tabular numbers. Navigation icons help identify destinations; widget headings do not need an icon when the page already supplies the context.

Use `Widget.Action` for inline underlined actions in widget headers and footers. Place filled buttons inside `Widget.Content` or in page actions; header and footer buttons always render as inline actions.

`Table` is the HeroUI primitive: compose its header, rows, cells and footer directly. `ResourceTable` composes `Table` from an items array and column definitions, with optional record links, navigation callbacks and an empty state. Use it for record lists such as members, passkeys, sessions and API keys. Tables own their frame: never put `Table`, `ResourceTable`, `HistoryTable` or another table pattern inside `Widget`. Render the table directly and put counts in the page heading or table footer. `ResourceTable` defaults to a scrolling table. Set `mobileLayout="stacked"` to present the same native rows and cells as a two-column detail grid below 640px. Accessible column headers remain available, visible mobile labels identify each detail, and the row header spans the full width. Columns with `mobileFullWidth: true` also span the detail grid; use this for long metadata and action groups. No columns or metadata are removed. API-key and MCP connection tables keep their columns at every width, with horizontal scrolling contained inside the table. API keys use Name, Permissions, Added, Expires, Last used and Actions; elapsed expiry dates carry an Expired label. Record links use `RouteLink` with the application's navigation provider.

Use `Widget` for related form content and metrics. Right-aligned actions require a right-aligned column header. Mark a meaningful row header with `isRowHeader` if it is not the first column. Empty-state content belongs inside the content area. Table cells have at most two lines: a primary value and optional secondary metadata. Place status chips and additional attributes in their own columns; do not append a third line below an identity. Truncate long values with an accessible full-value tooltip or use a detail view. Date formatters may return a primary date and one secondary time line, without wrapping either into additional lines. Table footers use `text-xs` muted metadata; the native table empty-state cell uses the same inner surface and padding as populated cells.

Use `InlineExternalLink` for external text links. It has one style, with a dashed underline offset of 2px and a new-tab marker. It opens in a new tab by default; setting another target omits the marker.

## Suspending retained overlays

Wrap a retained application subtree in `OverlaySuspensionScope` when the app temporarily presents another surface, such as sign-in after session expiry. Set `isSuspended` from the application’s state. Put the replacement surface outside the scope. The scope does not hide the application itself, establish authentication, cancel requests, or change logical open state.

```tsx
<>
  {expired && <SignIn brand={brand} onSubmit={signIn} />}
  <OverlaySuspensionScope isSuspended={expired}>
    <div hidden={expired} inert={expired}>
      <PasskeySettings {...passkeySettings} />
    </div>
  </OverlaySuspensionScope>
</>
```

Shared `Modal.Backdrop`, `AlertDialog.Backdrop`, `Dropdown.Popover`, `Popover.Content` and `Select.Popover` unmount their native portals during suspension. This releases native focus, inert and scroll locks without firing `onOpenChange`; logical open state retained by the native Root or the caller resumes when suspension ends. A standalone portal using only `defaultOpen` remounts its own local state. Native HeroUI props, refs, dismissal and interaction behavior remain available. A nested scope inherits its parent’s suspension.

Passkey add/rename, API-key creation, member forms and notification-destination dialogs keep non-secret field drafts above their backdrop. Controlled custom fields and children must keep their own draft state above the native portal. Password fields inside a dismissed portal are intentionally not retained. Preferences date-format, time-format and time-zone selectors use the supported native Select portal. Other primitives that own a portal, including calendar/combobox popovers and drawers, are not controlled by this scope; applications must close those through their native controlled APIs or conditionally compose their portal with `useOverlaySuspension().isSuspended`.

After a resumed Modal, AlertDialog, Dropdown or Popover root, or a Select, closes, the wrapper waits for the native exit to detach and restores its native trigger through React Aria's public contexts. Passkey add/rename and recovery-code completion retain their management opener explicitly. Restoration skips suspended, unmounted, hidden, inert or disabled targets and preserves focus deliberately moved to another live control. Standalone controlled dialogs without a native trigger context keep the caller's focus-return responsibility.

The application must abort or settle a suspended WebAuthn/request attempt and reject uncertain server acknowledgments. Shared async actions ignore a suspended or unmounted attempt’s late result and feedback, even after the same owner resumes. They retain pending state until the callback settles and permit a fresh request afterward. Unmount or key the retained application subtree when the authenticated owner changes so another account never inherits its drafts.

For a custom async overlay, call `const isCurrent = capture()` from `useOverlaySuspension()` before awaiting the app callback, then check `isCurrent()` before showing feedback, closing the dialog or storing its result. The predicate becomes false after suspension or owner unmount and stays false after resumption. This only guards UI continuation; the app still owns cancellation, request identity and committed server data.

Account settings breadcrumbs use `Account Settings / <page>` and routes `/settings/<page>`. Team settings use `Team Settings / <page>` and `/team-settings/<page>`; General is `/team-settings/general`. Sidebar labels use the same capitalization. A self-headed pattern such as PasskeySettings owns its heading padding; do not wrap its header and table in another gapped grid.

Account menus use API Keys, Email & Password and Leave Feedback, without a repository contribution item. Passkeys use the fingerprint icon, and sign out uses Logout01. Keep the shared light and dark surface ramp. It derives hue from the product accent with nearly neutral chroma; apps must not override backgrounds, cards, neutral controls or overlay colors. The sidebar identity highlight follows that accent in both themes. Settings category breadcrumbs are plain links, without a settings dropdown.
