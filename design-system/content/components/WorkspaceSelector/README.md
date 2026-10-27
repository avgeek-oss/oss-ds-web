# WorkspaceSelector

Workspace selection in the primary sidebar, using the same secondary-variant Select as filter controls. Workspace is a field label directly above the control, rather than a category heading. Choices have no leading icons; Create Workspace has a 17px plus icon.

**Use for** `ApplicationSidebar`'s `config.workspace`. The shell owns spacing and scroll behavior.

**Provide** `items`, `selectedKey`, `onSelectionChange` and optional `onCreate` and `isDisabled`. Apps own requests, creation dialogs and permissions.

Create Workspace calls `onCreate` while retaining the current workspace selection. The label, trigger, trailing indicator, selected tick and keyboard interaction come from the shared select.
