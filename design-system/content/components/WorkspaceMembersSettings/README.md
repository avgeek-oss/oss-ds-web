# WorkspaceMembersSettings

A workspace's members with Add people and Remove, for apps with workspaces.

**Use for** workspace membership, which the app owns. Adding or removing someone never changes their role.

**Provide** `workspaceName`, `providerName`, `members`, `people` (the directory), `formatDate`, awaited `onAdd(personId)` and `onRemove(personId)`.

**Don't** use it for app access; that is assigned in the provider.
