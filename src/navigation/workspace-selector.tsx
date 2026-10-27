"use client";

import { useId, type ComponentProps } from "react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Label } from "../forms/label.js";
import { Select, ListBox } from "../forms/select.js";
import { cn } from "../lib/utils.js";

export type WorkspaceSelectorItem = {
  id: string;
  name: string;
};

export type WorkspaceSelectorProps = ComponentProps<"section"> & {
  items: readonly WorkspaceSelectorItem[];
  selectedKey: string | null;
  onSelectionChange: (key: string) => void;
  onCreate?: () => void;
  isDisabled?: boolean;
};

export function WorkspaceSelector({
  items,
  selectedKey,
  onSelectionChange,
  onCreate,
  isDisabled,
  className,
  ...props
}: WorkspaceSelectorProps) {
  const createKey = useId();
  const selected = items.find((item) => item.id === selectedKey);
  return (
    <section className={cn("sidebar-section", className)} {...props}>
      <Select
        fullWidth
        variant="secondary"
        isDisabled={isDisabled}
        selectedKey={selectedKey}
        onSelectionChange={(key) => {
          if (key === createKey) onCreate?.();
          else if (key !== null && key !== selectedKey)
            onSelectionChange(String(key));
        }}
      >
        <Label>Workspace</Label>
        <Select.Trigger>
          <Select.Value className="min-w-0 flex-1 truncate">
            {selected?.name ?? "Select Workspace"}
          </Select.Value>
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover
          placement="bottom start"
          className="w-(--trigger-width) max-w-[calc(100vw-2rem)]"
        >
          <ListBox>
            {items.map((item) => (
              <ListBox.Item id={item.id} key={item.id} textValue={item.name}>
                <span className="min-w-0 flex-1 truncate">{item.name}</span>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
            {onCreate ? (
              <ListBox.Item id={createKey} textValue="Create Workspace">
                <HugeiconsIcon icon={Add01Icon} size={17} aria-hidden />
                <span className="min-w-0 flex-1">Create Workspace</span>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ) : null}
          </ListBox>
        </Select.Popover>
      </Select>
    </section>
  );
}
