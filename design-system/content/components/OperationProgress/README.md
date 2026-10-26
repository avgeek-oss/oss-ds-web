# OperationProgress

An ordered checklist of operation steps with status icons and expandable details.

**Use for** deployments, migrations and other multi-step operations. Use `ProgressChecklistItem` for custom composition.

**Provide** `steps` (`id`, `title`, `description`, `status` waiting · running · succeeded · failed · skipped · cancelled, details as children).

**Don't** convey status by color alone.
