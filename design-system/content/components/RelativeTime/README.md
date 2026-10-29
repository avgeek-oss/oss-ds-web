# RelativeTime

Timestamp shown relative to now, with the absolute time and time zone available.

**Use for** last-synced, created and activity times in tables and details. `stacked` (default) puts relative text over the absolute time; `relative` reads "Last synced 5 minutes ago"; `compact` keeps the absolute time in a tooltip; `absolute` shows only the absolute time.

**Provide** `value` (ISO timestamp), `label`, `formatAbsolute` and `timeZone` from the viewer's preferences, optional `display` and `locale`.

**Don't** start a timer per row; instances share one clock that refreshes while the page is visible.
