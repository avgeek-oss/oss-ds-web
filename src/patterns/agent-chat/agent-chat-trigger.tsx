"use client";

import { AiChat02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "../../buttons/button.js";

export interface AgentChatTriggerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Marks the button when an action waits for approval while the panel is closed. */
  needsAttention?: boolean;
  label?: string;
}

/**
 * Navbar action that opens and closes the agent panel. Place it in
 * `ApplicationNavbar`'s `actions`. AppLayout returns focus here when the
 * desktop panel closes.
 */
export function AgentChatTrigger({
  isOpen,
  onOpenChange,
  needsAttention = false,
  label = "Assistant",
}: AgentChatTriggerProps) {
  return (
    <Button
      aria-expanded={isOpen}
      aria-label={
        needsAttention && !isOpen
          ? `${label}, an action needs your approval`
          : label
      }
      className="relative shrink-0"
      data-app-aside-trigger=""
      isIconOnly
      variant={isOpen ? "primary" : "secondary"}
      onPress={() => onOpenChange(!isOpen)}
    >
      <HugeiconsIcon
        aria-hidden="true"
        className="size-4"
        icon={AiChat02Icon}
      />
      {needsAttention && !isOpen ? (
        <span
          aria-hidden="true"
          className="absolute -end-0.5 -top-0.5 size-2.5 rounded-full bg-accent ring-2 ring-background"
        />
      ) : null}
    </Button>
  );
}
