"use client";

import type { ComponentProps, ReactNode } from "react";
import {
  Area as RechartsArea,
  CartesianGrid,
  ComposedChart as RechartsComposedChart,
  Legend,
  Line as RechartsLine,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
} from "recharts";
import { ChartRangeSelection } from "./chart-range-selection.js";
import { cn } from "../lib/utils.js";
import { Spinner } from "../feedback/spinner.js";

type Datum = Record<string, unknown>;
type RootProps = Omit<ComponentProps<"div">, "children"> & {
  chartMargin?: ComponentProps<typeof RechartsComposedChart>["margin"];
  children: ReactNode;
  data: Datum[];
  height?: number;
  isLoading?: boolean;
  emptyContent?: ReactNode;
  syncId?: string;
};
function Root({
  chartMargin,
  children,
  className,
  data,
  height = 240,
  isLoading = false,
  emptyContent = "No data yet.",
  syncId,
  ...props
}: RootProps) {
  return (
    <div
      className={cn(
        "w-full [&_.recharts-surface:focus:not(:focus-visible)]:outline-none",
        className,
      )}
      style={{ height }}
      aria-busy={isLoading}
      {...props}
    >
      {data.length === 0 ? (
        <div
          className="grid h-full place-items-center text-sm text-muted"
          role="status"
        >
          {isLoading ? <Spinner aria-label="Loading chart" /> : emptyContent}
        </div>
      ) : (
        <ResponsiveContainer height="100%" width="100%">
          <RechartsComposedChart
            data={data}
            margin={{ top: 12, right: 8, bottom: 8, left: 8, ...chartMargin }}
            syncId={syncId}
            syncMethod="value"
          >
            {children}
          </RechartsComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function Grid(props: ComponentProps<typeof CartesianGrid>) {
  return (
    <CartesianGrid vertical={false} stroke="var(--separator)" {...props} />
  );
}

const axisTick = { fill: "var(--muted)", fontSize: 10 };
function XAxis(props: ComponentProps<typeof RechartsXAxis>) {
  return (
    <RechartsXAxis
      tick={axisTick}
      tickMargin={8}
      minTickGap={45}
      stroke="var(--muted)"
      {...props}
    />
  );
}
function YAxis(props: ComponentProps<typeof RechartsYAxis>) {
  return (
    <RechartsYAxis
      tick={axisTick}
      tickMargin={4}
      width="auto"
      stroke="var(--muted)"
      {...props}
    />
  );
}
function Line(props: ComponentProps<typeof RechartsLine>) {
  return (
    <RechartsLine
      type="linear"
      stroke="var(--chart-requested)"
      strokeWidth={1.8}
      dot={false}
      connectNulls={false}
      isAnimationActive={false}
      {...props}
    />
  );
}

function Area(props: ComponentProps<typeof RechartsArea>) {
  return (
    <RechartsArea
      type="monotone"
      stroke="var(--chart-requested)"
      strokeWidth={1.8}
      dot={false}
      connectNulls={false}
      isAnimationActive={false}
      {...props}
    />
  );
}

function ChartTooltip(props: ComponentProps<typeof Tooltip>) {
  return <Tooltip isAnimationActive={false} {...props} />;
}

function ChartLegend({
  wrapperStyle,
  ...props
}: ComponentProps<typeof Legend>) {
  return (
    <Legend
      iconType="circle"
      iconSize={8}
      wrapperStyle={{
        fontSize: 12,
        paddingTop: 12,
        color: "var(--muted)",
        ...wrapperStyle,
      }}
      {...props}
    />
  );
}

type TooltipEntry = {
  color?: string;
  dataKey?: string | number;
  name?: string | number;
  value?: string | number;
  payload?: Datum;
};
function TooltipContent({
  active,
  children,
  className,
  label,
  labelFormatter,
  payload,
  valueFormatter,
}: {
  active?: boolean;
  children?: ReactNode;
  className?: string;
  label?: unknown;
  labelFormatter?: (value: unknown) => ReactNode;
  payload?: TooltipEntry[];
  valueFormatter?: (
    value: string | number | undefined,
    key: string | number | undefined,
    datum: Datum | undefined,
  ) => ReactNode;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={cn(
        "grid gap-1 rounded-xl border border-separator bg-surface p-3 text-xs shadow-lg",
        className,
      )}
    >
      <div className="font-medium">
        {/* oxlint-disable-next-line typescript/no-base-to-string -- Recharts passes the category value (string, number or Date); String() is the intended conversion */}
        {labelFormatter ? labelFormatter(label) : String(label ?? "")}
      </div>
      {payload.map((item) => (
        <div
          className="flex items-center justify-between gap-6"
          key={String(item.dataKey ?? item.name)}
        >
          <span className="inline-flex items-center gap-2 text-muted">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.name}
          </span>
          <span className="font-medium tabular-nums">
            {valueFormatter
              ? valueFormatter(item.value, item.dataKey, item.payload)
              : item.value}
          </span>
        </div>
      ))}
      {children}
    </div>
  );
}
export const LineChart = Object.assign(Root, {
  Selection: ChartRangeSelection,
  Area,
  Grid,
  Line,
  Legend: ChartLegend,
  Root,
  ReferenceLine,
  Tooltip: ChartTooltip,
  TooltipContent,
  XAxis,
  YAxis,
});
