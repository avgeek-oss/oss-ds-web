# ProfileSettings

The Profile details widget: a name form with Save.

**Use for** the account Profile page inside `ApplicationPage`, with no extra wrapper padding.

**Provide** `value`, awaited `onSave(name)`; optional `title`, `label`, `maxLength`. `email` is deprecated.

**Don't** change the standard copy; names are trimmed, non-empty, at most 120 characters.
