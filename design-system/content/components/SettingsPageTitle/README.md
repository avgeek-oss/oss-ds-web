# SettingsPageTitle

The standard title for a common settings page: the shared label with its 24px icon.

## When to use

Use SettingsPageTitle as `titleContent` on Account and Team settings pages, so every app names and illustrates them the same way.

## What the consumer provides

`section`: `profile`, `preferences`, `email-password`, `passkeys`, `sessions`, `api-keys`, `mcp-connections`, `mcp`, `members` or `general`. Labels come from `settingsPageLabels` (Profile, Preferences, Email & Password, Passkeys, Sessions, API Keys, MCP Connections, MCP Guide, Members, General).

## Key props

`section`.

## Do / Don't

- Do keep the shared label; call passkey management Passkeys.
- Don't pass a custom string or icon for a common section.
