# OperationProgress

An ordered checklist of operation steps with status icons and expandable details.

## When to use

For deployments, migrations and other multi-step operations. Use `ProgressChecklistItem` inside `Accordion` for custom composition.

## What the consumer provides

`steps` (`id`, `title`, `description`, `status`: `waiting` | `running` | `succeeded` | `failed` | `skipped` | `cancelled`, optional `href`, details as `children`). The app maps its operation states.

## Key behavior

- Failed steps with details start expanded; waiting steps cannot expand.

## Do / Don't

- Status is carried by icon and label, never colour alone.
