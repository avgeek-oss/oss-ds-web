# SidebarAccountMenu

The identity button at the foot of the sidebar that opens the account menu: identity header, then labelled Account, product and Session sections.

## When to use

Use it as `ApplicationSidebar`'s `footerContent`. Keep account destinations here and in Account settings; don't add another account menu to the header.

## What the consumer provides

`name`, `email`, `teamName`, optional `avatarUrl`, `groups` (`{ id, label, items: [{ id, label, icon, destructive? }] }`) and `onAction(id)`. Without `avatarUrl` the avatar looks up Gravatar and falls back to initials.

## Key props

`name`, `email`, `teamName`, `avatarUrl`, `groups`, `onAction`.

## Do / Don't

- Do mark Sign out as `destructive` and put it in its own Session group.
- Don't add padding to the sections; dividers span the full popover width by design.
