# FileUpload

A single-attachment picker and drop area that uploads as soon as a file is chosen.

**Use for** one attachment at a time. Use `ProfileImageSettings` for profile images.

**Provide** `onUpload(file)` (rejects on failure), `accept`, `maxSizeBytes` (10 MiB), `label`, `description`, `isDisabled`.

**Don't** duplicate failures in the callback; a rejection shows one danger toast and keeps the file for retry.
