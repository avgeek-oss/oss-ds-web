# AgentChat

Assistant panel with the transcript, inline approvals for actions that change data, and the composer.

**Use for** an app's assistant. Place it in `AppLayout`'s `aside`; it docks beside the page on desktop and opens as a right drawer below 64rem.

**Provide** `productName`, `items`, `pending`, `status`, `onSend`, `onDecide`, and `describeTool` labels such as "Restart billing-worker". The props mirror `useAgentChat` state.

**Don't** decide which tools need approval in the panel; the server does.
