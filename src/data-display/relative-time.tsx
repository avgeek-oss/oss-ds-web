"use client";

import { useSyncExternalStore } from "react";
import { usePageVisibilityInterval } from "../hooks/use-page-visibility-interval.js";
import { TooltipText } from "../overlays/tooltip.js";
import { cn } from "../lib/utils.js";
import {
  TableCellDescription,
  tableCellStackClassName,
} from "./table-cell-text.js";

const refreshMs = 30_000;
const units = [
  ["second", 1, 60],
  ["minute", 60, 3_600],
  ["hour", 3_600, 86_400],
  ["day", 86_400, 604_800],
  ["week", 604_800, 2_629_800],
  ["month", 2_629_800, 31_557_600],
  ["year", 31_557_600, Infinity],
] as const;

/**
 * Relative text such as "5 minutes ago" or "in 3 days" from
 * `Intl.RelativeTimeFormat`. Differences under 30 seconds read as "now".
 */
export function formatRelativeTime(
  value: Date | number,
  now: number,
  locale?: string,
) {
  const difference =
    (typeof value === "number" ? value : value.getTime()) - now;
  const seconds = Math.abs(difference) / 1000;
  if (seconds < 30)
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      0,
      "second",
    );
  const [unit, duration] =
    units.find(([, , limit]) => seconds < limit) ?? units[6];
  return new Intl.RelativeTimeFormat(locale, { numeric: "always" }).format(
    Math.round(difference / (duration * 1000)),
    unit,
  );
}

// One clock shared by every mounted RelativeTime. Each instance keeps it fresh
// through usePageVisibilityInterval, which pauses in hidden tabs and runs on
// mount; ticks that arrive within half an interval of the last refresh are
// ignored, so a table of timestamps re-renders about once per interval rather
// than once per row. The clock can therefore trail the actual time by up to
// one and a half intervals.
const clockLagMs = refreshMs * 1.5;
const listeners = new Set<() => void>();
let currentTime = Date.now();
function refreshClock() {
  const now = Date.now();
  if (now - currentTime < refreshMs / 2) return;
  currentTime = now;
  for (const notify of listeners) notify();
}
function subscribeToClock(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
const clockSnapshot = () => currentTime;
const serverClockSnapshot = () => null;

/**
 * The shared, periodically refreshed time in milliseconds, or null while
 * rendering on the server and hydrating, so relative text never mismatches.
 */
export function useCurrentTime(): number | null {
  usePageVisibilityInterval(refreshClock, refreshMs, {
    runImmediately: true,
    runOnVisible: true,
  });
  return useSyncExternalStore(
    subscribeToClock,
    clockSnapshot,
    serverClockSnapshot,
  );
}

export type RelativeTimeDisplay =
  "stacked" | "relative" | "compact" | "absolute";
export type RelativeTimeProps = {
  /** An ISO 8601 timestamp. A missing or invalid value renders a dash. */
  value: string | null | undefined;
  /** What the time describes, such as "Last synced". */
  label: string;
  /** Formats the absolute time with the viewer's date and time preferences. */
  formatAbsolute: (value: Date) => string;
  /** The time zone `formatAbsolute` uses, shown in the tooltip and accessible name. */
  timeZone: string;
  /**
   * `stacked` shows relative text over the absolute time, `relative` shows
   * "label relative", `compact` shows relative text with the absolute time in
   * its tooltip, and `absolute` shows only the absolute time.
   */
  display?: RelativeTimeDisplay;
  /** The locale for relative text; defaults to the runtime locale. */
  locale?: string;
  className?: string;
};

export function RelativeTime({
  value,
  label,
  formatAbsolute,
  timeZone,
  display = "stacked",
  locale,
  className,
}: RelativeTimeProps) {
  const now = useCurrentTime();
  const date = value ? new Date(value) : null;
  if (!value || !date || !Number.isFinite(date.getTime()))
    return (
      <span aria-label={`${label} unavailable`} className={className}>
        —
      </span>
    );
  const absolute = formatAbsolute(date);
  // A timestamp received between refreshes can be newer than the clock; one
  // within the clock's possible lag is the present rather than the future.
  const time = date.getTime();
  const relative =
    now === null
      ? null
      : formatRelativeTime(
          date,
          time > now && time - now <= clockLagMs ? time : now,
          locale,
        );
  if (display === "relative")
    return (
      <time
        dateTime={value}
        className={cn("whitespace-nowrap tabular-nums", className)}
      >
        {relative ? `${label} ${relative}` : "—"}
      </time>
    );
  if (display === "absolute")
    return (
      <TooltipText
        as="time"
        dateTime={value}
        tooltip={timeZone}
        placement="left"
        aria-label={`${label}: ${absolute} ${timeZone}`}
        className={cn("whitespace-nowrap tabular-nums", className)}
      >
        {absolute}
      </TooltipText>
    );
  const name = `${label}: ${absolute} ${timeZone}${relative ? `, ${relative}` : ""}`;
  if (display === "compact")
    return (
      <TooltipText
        as="time"
        dateTime={value}
        tooltip={`${absolute} ${timeZone}`}
        placement="left"
        aria-label={name}
        className={cn("whitespace-nowrap tabular-nums", className)}
      >
        {relative ?? "—"}
      </TooltipText>
    );
  return (
    <TooltipText
      as="time"
      dateTime={value}
      tooltip={timeZone}
      placement="left"
      aria-label={name}
      className={cn(
        tableCellStackClassName,
        "whitespace-nowrap tabular-nums",
        className,
      )}
    >
      <span aria-hidden={!relative}>{relative ?? " "}</span>
      <TableCellDescription>{absolute}</TableCellDescription>
    </TooltipText>
  );
}
