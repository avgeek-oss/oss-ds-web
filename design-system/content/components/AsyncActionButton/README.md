# AsyncActionButton

Button that awaits `onAction`, shows a pending label and can confirm first.

**Use for** one awaited mutation, such as Save changes or Revoke session. Use `Button` when nothing is awaited.

**Props** `onAction` promise, optional `pendingLabel` and `confirmation` `{ title, description, confirmLabel }`, plus `Button` props.

**Don't** add your own pending state or show the failure inline; a rejection shows one danger toast.
