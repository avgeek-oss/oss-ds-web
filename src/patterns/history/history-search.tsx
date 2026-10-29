"use client";

import { useId, useState } from "react";
import { Input } from "../../forms/input.js";
import { Label } from "../../forms/label.js";
import { Button } from "../../buttons/button.js";

export type HistorySearchProps = {
  label: string;
  placeholder?: string;
  onSearch: (value: string) => void;
  /**
   * The applied search, such as one read from the URL. The field shows it
   * initially and again whenever it changes, replacing an unsubmitted draft.
   */
  value?: string;
};
export function HistorySearch({
  label,
  placeholder,
  onSearch,
  value: applied = "",
}: HistorySearchProps) {
  const id = useId();
  const [value, setValue] = useState(applied);
  const [shown, setShown] = useState(applied);
  if (shown !== applied) {
    setShown(applied);
    setValue(applied);
  }
  return (
    <form
      role="search"
      className="grid min-w-0 gap-1"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(value.trim());
      }}
    >
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type="search"
          className="min-w-0 flex-1"
          placeholder={placeholder}
          value={value}
          maxLength={200}
          onChange={(event) => {
            setValue(event.target.value);
            if (!event.target.value) onSearch("");
          }}
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </div>
    </form>
  );
}
