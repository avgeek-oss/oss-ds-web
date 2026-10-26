# LineChart

A line and area chart with shared axes, grid, colors and tooltips.

**Use for** time series inside a `Widget`, with `Widget.Legend` for labels.

**Props** `data`, `height` (240), `isLoading`, `emptyContent`; children `Grid`, `XAxis`, `YAxis`, `Line`, `Area`, `Tooltip`, `Selection`.

**Don't** hard-code series colors; use `--chart-requested`, `--chart-succeeded`, `--chart-failed`.
