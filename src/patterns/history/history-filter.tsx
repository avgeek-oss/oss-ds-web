"use client";
import type { ReactNode } from "react";
import { Select, ListBox } from "../../forms/select.js";
import { Label } from "../../forms/label.js";
import { Autocomplete, SearchField } from "../../pickers/autocomplete.js";

export type HistoryFilterProps = {
  label: string;
  value?: string;
  options: {
    id: string;
    label: string;
    icon?: ReactNode;
    searchText?: string;
    trailing?: ReactNode;
    selectedLabel?: string;
    ariaLabel?: string;
  }[];
  onChange: (value: string) => void;
  allIcon?: ReactNode;
  searchPlaceholder?: string;
};

export function HistoryFilter({
  label,
  value,
  options,
  onChange,
  allIcon,
  searchPlaceholder,
}: HistoryFilterProps) {
  const selected = options.find((option) => option.id === value);
  const selectedIcon = selected?.icon ?? allIcon;
  const list = (
    <ListBox
      className={searchPlaceholder ? "max-h-72 overflow-y-auto" : undefined}
      renderEmptyState={() => (
        <p className="px-3 py-4 text-sm text-muted">
          No matching {label.toLowerCase()}.
        </p>
      )}
    >
      <ListBox.Item id="all" textValue={`All ${label.toLowerCase()}`}>
        {allIcon ? (
          <span className="shrink-0" aria-hidden="true">
            {allIcon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">All {label.toLowerCase()}</span>
        <ListBox.ItemIndicator />
      </ListBox.Item>
      {options.map((option) => (
        <ListBox.Item
          id={option.id}
          key={option.id}
          textValue={option.searchText ?? option.label}
          aria-label={option.ariaLabel ?? option.label}
        >
          {option.icon ? (
            <span className="shrink-0" aria-hidden="true">
              {option.icon}
            </span>
          ) : null}
          <span className="min-w-0 flex-1 truncate">{option.label}</span>
          {option.trailing ? (
            <span className="shrink-0">{option.trailing}</span>
          ) : null}
          <ListBox.ItemIndicator />
        </ListBox.Item>
      ))}
    </ListBox>
  );
  return (
    <Select
      fullWidth
      variant="secondary"
      selectedKey={value || "all"}
      onSelectionChange={(key) => {
        if (key !== null) onChange(key === "all" ? "" : String(key));
      }}
    >
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value>
          <span className="flex min-w-0 max-w-full items-center gap-2">
            {selectedIcon ? (
              <span
                className="inline-flex shrink-0 items-center justify-center leading-none [&_svg]:size-4 [&>img]:size-4"
                aria-hidden="true"
              >
                {selectedIcon}
              </span>
            ) : null}
            <span className="min-w-0 flex-1 truncate">
              {selected?.selectedLabel ??
                selected?.label ??
                `All ${label.toLowerCase()}`}
            </span>
          </span>
        </Select.Value>
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover
        className={`w-(--trigger-width) max-w-[calc(100vw-2rem)] ${searchPlaceholder ? "min-w-[min(18rem,calc(100vw-2rem))] overflow-hidden" : ""}`}
      >
        {searchPlaceholder ? (
          <Autocomplete.Filter
            filter={(text, search) =>
              text
                .toLocaleLowerCase()
                .includes(search.trim().toLocaleLowerCase())
            }
          >
            <SearchField
              aria-label={`Search ${label.toLowerCase()}`}
              className="p-2"
              variant="secondary"
            >
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input
                  className="text-base sm:text-sm"
                  placeholder={searchPlaceholder}
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
