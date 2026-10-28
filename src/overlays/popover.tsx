"use client";

import { Popover as HeroPopover, type PopoverProps } from "@heroui/react";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { useRef, type ComponentProps } from "react";
import { mergeRefs } from "@react-aria/utils";
import { useSuspendedOverlayFocus } from "./use-suspended-overlay-focus.js";

function PopoverRoot(props: PopoverProps) {
  return <HeroPopover {...props} />;
}

function PopoverTrigger(props: AriaButtonProps) {
  return <AriaButton {...props} />;
}

function PopoverContent(props: ComponentProps<typeof HeroPopover.Content>) {
  const overlay = useRef<HTMLDivElement>(null);
  // oxlint-disable-next-line react/refs -- reads props.isOpen, not a ref; React 19 passes ref as a prop, so the rule treats props as a ref
  const isSuspended = useSuspendedOverlayFocus(props.isOpen, overlay);
  return isSuspended ? null : (
    <HeroPopover.Content {...props} ref={mergeRefs(overlay, props.ref)} />
  );
}

export const Popover = Object.assign(PopoverRoot, HeroPopover, {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
});

export type { PopoverProps } from "@heroui/react";
