# FilterDialog

A Filters button that opens a dialog for building field/operator/value conditions.

**Use for** lists that need several structured conditions. `HistoryFilter` covers a single option.

**Provide** `fields`, controlled `value` and `onChange`, optional `getOptions(field, search)`, `renderOption`, `maxConditions` (8).

**Don't** expect it to search; the app defines operator meanings and implements search.
