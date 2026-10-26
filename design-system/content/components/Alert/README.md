# Alert

Inline alert with status indicator, title and description.

**Use for** persistent notices such as access restrictions or expiries. Use a danger toast for submission failures, `QueryError` for failed loads.

**Props** `status` default · accent · success · warning · danger; children `Alert.Indicator`, `Alert.Title`, `Alert.Description`.

**Don't** show a failed submission inline when a toast reports it.
