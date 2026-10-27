# AppShell

Application frame: 240px sidebar, header with breadcrumb and actions, and content column.

**Use for** every product page, with `AppLayout`, `ApplicationSidebar`, `ApplicationNavbar` and `ApplicationPage`. Public auth uses `AuthScreen`.

**Provide** `policy`, `contentWidth`, sidebar `config` (brand, `groups` of links), navbar `actions`, and a `RouteProvider`. Preview uses a stand-in logo.

**Spacing** sidebar bodies and footer actions use 18px top, 16px bottom and 12px horizontal padding. Desktop entity-header bodies use 16px top padding so their centered text starts at 18px, matching category/field labels. `AppShell.Content` supplies 16px horizontal and bottom padding; the page title owns the 16px top inset.

**Don't** add top padding around page content.

Use `config.workspace` for the shared `WorkspaceSelector` before primary navigation groups. Its Workspace field label and native Select match sidebar filters. The shell owns its placement; do not reserve space with app CSS. Navigation icons are 17px, muted by default and foreground when selected. Navigation labels keep normal weight in both states; destructive icons retain their semantic color. Navigation rows adapt from 36px for fine input to 44px for coarse input, sections have a 14px gap, and items in a category have no gap. Entity headers reserve the same space below their text as navigation rows to keep the text-to-category gaps consistent.

Header and drawer toggles use the same foreground icon and match the notification and appearance button sizes. Their hover surface clears on activation. The header toggle icon aligns with sidebar item icons.

Set `brandUpdateVersion` to show a small yellow dot beside the current version. With `brandUpdateHref`, the version and dot link to the app's update page. The update state does not change the brand layout.
