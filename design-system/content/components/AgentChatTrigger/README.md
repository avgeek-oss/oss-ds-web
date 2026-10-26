# AgentChatTrigger

Navbar button that opens and closes the assistant panel.

**Use for** `ApplicationNavbar`'s `actions`, paired with `AgentChat` in `AppLayout`'s `aside`. Focus returns here when the desktop panel closes.

**Props** `isOpen`, `onOpenChange`, `needsAttention` (marks a waiting approval while closed), `label` (default "Assistant").

**Don't** replace it with a custom button; the aside's focus return depends on it.
