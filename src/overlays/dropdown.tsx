"use client";

import { Dropdown as HeroDropdown } from "@heroui/react";
import { useRef, type ComponentProps } from "react";
import { mergeRefs } from "@react-aria/utils";
import { useSuspendedOverlayFocus } from "./use-suspended-overlay-focus.js";

function DropdownRoot(props: ComponentProps<typeof HeroDropdown>) {
  return <HeroDropdown {...props} />;
}
function DropdownPopover(props: ComponentProps<typeof HeroDropdown.Popover>) {
  const overlay = useRef<HTMLDivElement>(null);
  // oxlint-disable-next-line react/refs -- reads props.isOpen, not a ref; React 19 passes ref as a prop, so the rule treats props as a ref
  const isSuspended = useSuspendedOverlayFocus(props.isOpen, overlay);
  return isSuspended ? null : (
    <HeroDropdown.Popover {...props} ref={mergeRefs(overlay, props.ref)} />
  );
}
export const Dropdown = Object.assign(DropdownRoot, HeroDropdown, {
  Popover: DropdownPopover,
});
export { Header } from "@heroui/react";
