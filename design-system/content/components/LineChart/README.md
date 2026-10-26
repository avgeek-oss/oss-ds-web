# LineChart

A Recharts-based line and area chart with shared axes, grid, line widths, colors and tooltips.

## When to use

Use for time series inside a `Widget`. Pair with `Widget.Legend` for series labels and `LineChart.Selection` for range selection.

## What the consumer provides

`data` (array of records), optional `height` (default 240), `isLoading`, `emptyContent`, `syncId`; children `LineChart.Grid`, `XAxis`, `YAxis`, `Line`, `Area`, `Tooltip`/`TooltipContent`, `ReferenceLine`, `Selection`, `Legend`.

## Key props

- Series default to `--chart-requested`; set `stroke="var(--chart-failed)"` or `var(--chart-succeeded)` for other series.
- Empty data shows "No data yet." or a spinner while `isLoading`.
- `Area` supports filled or stacked series; define a chart-local SVG gradient for a fading fill.

## Do / Don't

- Do use the chart tokens so apps can override series colors.
- Don't connect missing measurements across gaps.
