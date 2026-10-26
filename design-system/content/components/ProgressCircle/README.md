# ProgressCircle

Circular progress indicator, determinate or indeterminate.

**Use for** measurable progress such as an upload. Use `Spinner` for unknown durations and `OperationProgress` for multi-step operations.

**Props** `value` (0–100) or `isIndeterminate`; `minValue`, `maxValue`; `aria-label`; parts `Track` → `TrackCircle` + `FillCircle`.

**Don't** use it as decoration; label what is progressing.
