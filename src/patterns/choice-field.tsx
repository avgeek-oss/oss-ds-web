"use client";

import type { ReactNode } from "react";
import { Select, ListBox } from "../forms/select.js";
import { Label } from "../forms/label.js";
import { Description } from "../forms/description.js";
import { Autocomplete, SearchField } from "../pickers/autocomplete.js";
import { cn } from "../lib/utils.js";

export type ChoiceOption<T extends string = string> = {
  id: T;
  label: string;
  description?: string;
  /** Leading content such as an icon, logo or avatar; SVG icons use 16px. */
  icon?: ReactNode;
  /** Trailing metadata, such as a count, that is also searched and announced. */
  endContent?: string;
  /** Shows the label in the muted color, for choices such as Unassigned. */
  muted?: boolean;
};
export type ChoiceFieldProps<T extends string = string> = {
  label: string;
  value: T;
  options: readonly ChoiceOption<T>[];
  onChange: (value: T) => void;
  isDisabled?: boolean;
  isRequired?: boolean;
  /** Keeps the label for assistive technology but hides it visually. */
  hideLabel?: boolean;
  /** Help text below the field, linked to it as its description. */
  description?: ReactNode;
  /** Adds a search field above the options that filters their text. */
  search?: boolean;
  fullWidth?: boolean;
  className?: string;
};

function optionText(option: ChoiceOption) {
  return [option.label, option.description, option.endContent]
    .filter(Boolean)
    .join(" ");
}
function OptionIcon({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center [&_svg]:size-4"
    >
      {children}
    </span>
  );
}
function EndContent({ children }: { children: string }) {
  return (
    <span className="shrink-0 text-sm/5 font-normal text-muted tabular-nums">
      {children}
    </span>
  );
}

export function ChoiceField<T extends string>({
  label,
  value,
  options,
  onChange,
  isDisabled,
  isRequired,
  hideLabel = false,
  description,
  search = false,
  fullWidth,
  className,
}: ChoiceFieldProps<T>) {
  const selected = options.find((option) => option.id === value);
  const list = (
    <ListBox
      className={
        search ? "min-h-0 flex-1 overflow-y-auto overscroll-contain" : undefined
      }
      renderEmptyState={
        search
          ? () => (
              <p className="px-3 py-4 text-sm text-muted">
                No matching {label.toLowerCase()}.
              </p>
            )
          : undefined
      }
    >
      {options.map((option) => (
        <ListBox.Item
          id={option.id}
          key={option.id}
          textValue={optionText(option)}
          aria-label={optionText(option)}
        >
          <div className="grid min-w-0 flex-1 gap-1">
            <span className="flex min-w-0 items-center gap-2">
              {option.icon ? <OptionIcon>{option.icon}</OptionIcon> : null}
              <span
                className={cn("min-w-0 flex-1", option.muted && "text-muted")}
              >
                {option.label}
              </span>
              {option.endContent ? (
                <EndContent>{option.endContent}</EndContent>
              ) : null}
            </span>
            {option.description ? (
              <span className="text-xs font-normal whitespace-normal text-muted">
                {option.description}
              </span>
            ) : null}
          </div>
          <ListBox.ItemIndicator />
        </ListBox.Item>
      ))}
    </ListBox>
  );
  return (
    <Select
      aria-label={label}
      variant="secondary"
      selectedKey={value}
      isDisabled={isDisabled}
      isRequired={isRequired}
      fullWidth={fullWidth}
      className={className}
      onSelectionChange={(key) => {
        const option = options.find((item) => item.id === key);
        if (option) onChange(option.id);
      }}
    >
      <Label
        isRequired={isRequired}
        className={hideLabel ? "sr-only" : undefined}
      >
        {label}
      </Label>
      <Select.Trigger>
        <Select.Value className="flex min-w-0 flex-1 items-center gap-2">
          {selected?.icon ? <OptionIcon>{selected.icon}</OptionIcon> : null}
          <span
            className={cn(
              "min-w-0 flex-1 truncate",
              selected?.muted && "text-muted",
            )}
          >
            {selected?.label ?? "Select…"}
          </span>
          {selected?.endContent ? (
            <EndContent>{selected.endContent}</EndContent>
          ) : null}
        </Select.Value>
        <Select.Indicator />
      </Select.Trigger>
      {description ? <Description>{description}</Description> : null}
      <Select.Popover
        className={
          search
            ? "flex w-(--trigger-width) max-w-[calc(100vw-2rem)] min-w-[min(18rem,calc(100vw-2rem))] flex-col overflow-hidden"
            : undefined
        }
      >
        {search ? (
          <Autocomplete.Filter
            filter={(text, query) =>
              text
                .toLocaleLowerCase()
                .includes(query.trim().toLocaleLowerCase())
            }
          >
            <SearchField
              aria-label={`Search ${label.toLowerCase()}`}
              className="relative z-10 shrink-0 bg-overlay p-2"
              variant="secondary"
            >
              <SearchField.Group className="rounded-md">
                <SearchField.SearchIcon />
                <SearchField.Input
                  className="text-base sm:text-sm"
                  placeholder="Search…"
                  maxLength={200}
                  autoComplete="off"
                  spellCheck={false}
                  autoFocus={
                    typeof window !== "undefined" &&
                    window.matchMedia("(pointer: fine)").matches
                  }
                />
                <SearchField.ClearButton
                  aria-label={`Clear ${label.toLowerCase()} search`}
                />
              </SearchField.Group>
            </SearchField>
            {list}
          </Autocomplete.Filter>
        ) : (
          list
        )}
      </Select.Popover>
    </Select>
  );
}
