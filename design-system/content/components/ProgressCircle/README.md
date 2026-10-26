# ProgressCircle

HeroUI's circular progress indicator, determinate or indeterminate.

## When to use

Use when progress is measurable, such as an upload. Use `Spinner` for unknown durations and `OperationProgress` for multi-step operations.

## What the consumer provides

`value` (0–100) or `isIndeterminate`, an `aria-label`, and the parts `ProgressCircle.Track` → `ProgressCircle.TrackCircle` + `ProgressCircle.FillCircle`.

## Key props

- `value`, `minValue`, `maxValue`, `isIndeterminate`.

## Do / Don't

- Do label what is progressing ("Upload 70 percent").
- Don't use it as decoration.
