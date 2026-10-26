# FileUpload

A single-attachment upload control: a keyboard-accessible picker button and a dashed drop area that uploads as soon as a file is chosen.

## When to use

- One attachment at a time. Use `ProfileImageSettings` for profile images, which use the account's Gravatar.

## What the consumer provides

- `onUpload(file)`, which resolves only after the upload and metadata save succeed and rejects on failure.
- `accept` (default `image/*,application/pdf`), `maxSizeBytes` (default 10 MiB), `label` (default "Upload attachment"), `description`, and `isDisabled` from permissions.
- Optional `initialFile` for an app-owned page drop.
- Div attributes and a ref for layout.

## Key props

- States: idle, Uploading… (spinner inside the button; picker, drop and retry locked), and failed (Retry upload and Choose another file). Success clears the selection.

## Do / Don't

- Do describe the supported types and size limit in `description`.
- Don't duplicate upload failures in the callback. A rejection shows one danger toast and keeps the file for retry.
- Client checks are feedback only. Revalidate type and size on the server.
