# Component catalog

Primitives keep HeroUI's native variants. Patterns are complete, reviewed surfaces. Layouts frame the app.

## Layouts and navigation

- `AppShell` with `ApplicationPage`: every product page.
- `AuthScreen`: public auth screens.
- `SecondarySidebarLayout`: sections with their own sub-navigation.
- `BreadcrumbTrail`: page ancestry; `BreadcrumbDropdown` switches sibling pages.
- `Tabs`: switching views within a page.
- `Pagination`: known totals or cursor pages.
- `SettingsPageTitle`: standard settings titles and icons.
- `BrandLockup`: 32px app mark with name.
- `ThemeSwitcher`: system, light or dark.

## Actions and forms

- `Button`: actions; `secondary` for cancel, `danger` or `danger-soft` for destructive.
- `ToggleButton`: on/off or segmented choices.
- `AsyncActionButton`: awaited actions with locking and failure toast.
- `Input`, `Textarea`, `PasswordInput`, `InputGroup`: text entry; `TextField` for a labelled input or textarea with help text.
- `Field`, `Label`, `Description`: field structure and help text.
- `Checkbox`, `Switch`: boolean settings.
- `Select`: choosing from a list; `ChoiceField` for described role or permission choices and searchable app pickers such as assignees.
- `ComboBox`, `Autocomplete`: searchable choices.
- `FileUpload`: one image or PDF by picker or drag and drop.

## Dates and time

- `DatePicker`: calendar entry; `DateField` for segmented entry alone; `DatePickerField` for a labelled, clearable `YYYY-MM-DD` date.
- `DateRangePicker`, `RangeCalendar`: date ranges.
- `TimeField`: times; `DateTimeRangePicker` for ranges with times.
- `Calendar`: inline month view.

## Data display

- `ResourceTable`: item and column record lists.
- `Table`: direct table composition.
- `Widget`: titled card with actions, legend and footer.
- `Attributes`: label and value lists; `ExpandableAttributeList` when some rows expand.
- `ListView`, `ListBox`: simple lists and selectable options.
- `Accordion`, `Disclosure`: collapsible sections.
- `Chip`: short metadata; `StatusIndicator` for domain status.
- `RelativeTime`: timestamps relative to now, with the absolute time and time zone.
- `Avatar`, `UserAvatar`: people, with initials fallback.
- `EmptyState`: successful requests with no records.
- `LineChart`: time series inside a `Widget`.
- `Typography`, `CodeBlock`: text styles and code.

## Feedback and overlays

- `Alert`: inline status messages.
- `Toast`: mutation results, one bottom-center provider per app.
- `Spinner`, `ProgressCircle`, `Skeleton`, `LoadingSkeleton`: loading states.
- `Modal`, `Drawer`: focused tasks; `Dialog` for a titled modal with a footer; `AlertDialog` and `ActionConfirmation` for consequences.
- `Popover`, `Dropdown`, `Tooltip`, `HeadingHelp`: anchored content and menus.
- `ErrorPage`, `QueryError`, `BackendUnavailable`: route, query and outage failures.

## Patterns

- Auth: `SignIn`, `ForgotPassword`, `VerificationEmail`, `PasswordSetup`, `PasskeyVerification`, `RecoveryCodesScreen`, `TeamSetup`, `AcceptInvitation`, `McpAuthorization`.
- Account: `ProfileSettings`, `PreferencesSettings`, `PasskeySettings`, `SessionsSettings`, `ApiKeysSettings`, `McpGuideSettings`.
- Team: `MembersTable`, `InvitationsTable`, `InviteMemberDialog`, `TeamGeneralSettings`.
- Assistant: `AgentChat` (panel in `AppLayout`'s `aside`), `AgentChatTrigger` (navbar button).
- Data: `HistoryTable`, `FilterDialog`, `OperationProgress`, `IntegrationConnectionCard`, `NotificationMenu`, `NotificationDestinationsSettings`.
