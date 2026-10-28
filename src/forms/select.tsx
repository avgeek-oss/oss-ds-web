"use client";

import { Select as HeroSelect, type SelectProps } from "@heroui/react";
import { useContext, useRef, type ComponentProps } from "react";
import { SelectStateContext } from "react-aria-components";
import { mergeRefs } from "@react-aria/utils";
import { useSuspendedOverlayFocus } from "../overlays/use-suspended-overlay-focus.js";

function SelectRoot<
  T extends object = object,
  M extends "single" | "multiple" = "single",
>(props: SelectProps<T, M>) {
  return <HeroSelect<T, M> {...props} />;
}
function SelectPopover(props: ComponentProps<typeof HeroSelect.Popover>) {
  const state = useContext(SelectStateContext);
  const overlay = useRef<HTMLDivElement>(null);
  const isSuspended = useSuspendedOverlayFocus(
    // oxlint-disable-next-line react/refs -- reads props.isOpen, not a ref; React 19 passes ref as a prop, so the rule treats props as a ref
    props.isOpen ?? state?.isOpen,
    overlay,
  );
  return isSuspended ? null : (
    <HeroSelect.Popover {...props} ref={mergeRefs(overlay, props.ref)} />
  );
}
export const Select = Object.assign(SelectRoot, HeroSelect, {
  Popover: SelectPopover,
});
export { ListBox } from "@heroui/react";
export type { ListBoxProps, SelectProps } from "@heroui/react";
