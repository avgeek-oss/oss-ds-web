export const dateFormatOptions = [
  { id: "day-short-month-year", label: "16 Sept 2026" },
  { id: "short-month-day-year", label: "Sept 16, 2026" },
  { id: "year-month-day", label: "2026-09-16" },
  { id: "day-month-year", label: "16/09/2026" },
  { id: "month-day-year", label: "09/16/2026" },
] as const;

export const timeFormatOptions = [
  { id: "24-hour", label: "14:30" },
  { id: "12-hour", label: "2:30 PM" },
  { id: "24-hour-seconds", label: "14:30:45" },
  { id: "12-hour-seconds", label: "2:30:45 PM" },
] as const;

export type DateFormatId = (typeof dateFormatOptions)[number]["id"];
export type TimeFormatId = (typeof timeFormatOptions)[number]["id"];
export type StandardDateTimePreferences = {
  dateFormat: DateFormatId;
  timeFormat: TimeFormatId;
  timeZone: string;
};

export const defaultDateTimePreferences = {
  dateFormat: "day-short-month-year",
  timeFormat: "24-hour",
  timeZone: "UTC",
} as const satisfies StandardDateTimePreferences;

/**
 * Whether the runtime accepts `value` as an IANA time zone. Offsets such as
 * `+05:30` are rejected, so stored preferences always name a zone.
 */
export function isTimeZone(value: string) {
  if (!value || value.length > 100 || /^[+-]/.test(value)) return false;
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/** The runtime's IANA time zones, UTC first and then alphabetical. */
export function availableTimeZones() {
  // Some ICU versions list only an older name for a zone while accepting the
  // current one, so the current names are added and then deduplicated.
  return [
    ...new Set(
      [
        "UTC",
        ...Intl.supportedValuesOf("timeZone"),
        "Asia/Kolkata",
        "Asia/Kathmandu",
        "Asia/Yangon",
        "Europe/Kyiv",
        "America/Nuuk",
        "Pacific/Kanton",
      ].filter(isTimeZone),
    ),
  ].sort((left, right) =>
    left === "UTC" ? -1 : right === "UTC" ? 1 : left.localeCompare(right),
  );
}
