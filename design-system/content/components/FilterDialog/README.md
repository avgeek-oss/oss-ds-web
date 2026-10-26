# FilterDialog

A Filters button that opens a dialog for building field/operator/value conditions.

## When to use

When a list needs several structured conditions; `HistoryFilter` covers a single option.

## What the consumer provides

`fields` (`field`, `label`, `operators` with `value`/`label`/`multiple`, optional `placeholder`, `pattern`, `maxLength`, `searchable`, `icon`), controlled `value` and `onChange`, optional stable `getOptions(field, search)` and `renderOption`, `maxConditions` (8). The preview opens the dialog through its own trigger.

## Key behavior

- Edits a draft until Apply; Cancel keeps committed conditions; duplicates are removed on Apply.
- Multi-value operators use a picker when `getOptions` is supplied.

## Do / Don't

- The app defines operator meanings and implements search.
