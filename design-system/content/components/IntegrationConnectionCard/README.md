# IntegrationConnectionCard

One provider connection with its status, details and actions.

**Use for** each third-party connection; a null `connection` renders the connect state.

**Provide** `provider`, `connection`, `emptyDescription`, `disconnectDescription`, and awaited `onConnect`, `onReauthorize`, `onDisconnect`.

**Don't** handle OAuth redirects in the card; the app owns them.
