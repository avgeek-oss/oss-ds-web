"use client";

import { useRef } from "react";
import { parseDate } from "@internationalized/date";
import { CloseButton } from "@heroui/react";
import { DateField } from "../forms/date-field.js";
import { Label } from "../forms/label.js";
import { DatePicker } from "../pickers/date-picker.js";
import { Calendar } from "../pickers/calendar.js";

export type DatePickerFieldProps = {
  label: string;
  /** A calendar date as `YYYY-MM-DD`, or null when empty. */
  value: string | null;
  onChange: (value: string | null) => void;
  isDisabled?: boolean;
  variant?: "primary" | "secondary";
};

/**
 * A labelled, clearable calendar date. Clearing returns focus to the
 * calendar button so keyboard users keep their place.
 */
export function DatePickerField({
  label,
  value,
  onChange,
  isDisabled = false,
  variant = "secondary",
}: DatePickerFieldProps) {
  const calendarTrigger = useRef<HTMLButtonElement>(null);
  const name = label.toLowerCase();
  return (
    <DatePicker
      className="w-full"
      value={value ? parseDate(value) : null}
      onChange={(date) => onChange(date?.toString() ?? null)}
      isDisabled={isDisabled}
    >
      <Label>{label}</Label>
      <DateField.Group variant={variant} fullWidth>
        <DateField.Input>
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix className="gap-1">
          {value && !isDisabled ? (
            <CloseButton
              slot={null}
              aria-label={`Clear ${name}`}
              onPress={() => {
                onChange(null);
                calendarTrigger.current?.focus();
              }}
            />
          ) : null}
          <DatePicker.Trigger
            ref={calendarTrigger}
            className="w-auto"
            aria-label={`Choose ${name}`}
          >
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover placement="bottom end">
        <Calendar aria-label={`Choose ${name}`}>
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>
              {(date) => <Calendar.Cell date={date} />}
            </Calendar.GridBody>
          </Calendar.Grid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
}
