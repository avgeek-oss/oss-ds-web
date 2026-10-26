# Toast

Transient feedback at bottom center; where submission failures are reported.

**Use for** `toast.danger(...)` on a failed mutation, and `success` / `info` / `warning` confirmations.

**Provide** one `Toast.Provider placement="bottom"` for the whole app. Messages name the action and next step.

**Don't** also show the same failure inline, or mount a second provider.
