# AppShell

Application frame: 240px sidebar, header with breadcrumb and actions, and content column.

**Use for** every product page, with `AppLayout`, `ApplicationSidebar`, `ApplicationNavbar` and `ApplicationPage`. Public auth uses `AuthScreen`.

**Provide** `policy`, `contentWidth`, sidebar `config` (brand, `groups` of links), navbar `actions`, and a `RouteProvider`. Preview uses a stand-in logo.

**Don't** add top padding around page content.
