# IntegrationConnectionCard

One provider connection: status, details, and connect, reauthorize and disconnect actions.

## When to use

For each third-party provider connection; compose several cards for multiple installations.

## What the consumer provides

`provider` (`name`, optional `icon`), nullable `connection` (`id`, `status`, `details`), `emptyDescription`, an accurate `disconnectDescription`, optional awaited `onConnect`, `onReauthorize`, `onDisconnect`, `children`.

## Key behavior

- A null connection renders the connect state.

## Do / Don't

- OAuth redirects and callback validation stay in the app.
- Report action failures with one danger toast.
