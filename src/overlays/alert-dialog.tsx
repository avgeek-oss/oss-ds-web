"use client";
import {
  AlertDialog as HeroAlertDialog,
  type AlertDialogProps,
} from "@heroui/react";
import { useRef, type ComponentProps } from "react";
import { mergeRefs } from "@react-aria/utils";
import { useSuspendedOverlayFocus } from "./use-suspended-overlay-focus.js";

function AlertDialogRoot(props: AlertDialogProps) {
  return <HeroAlertDialog {...props} />;
}
function AlertDialogBackdrop(
  props: ComponentProps<typeof HeroAlertDialog.Backdrop>,
) {
  const overlay = useRef<HTMLDivElement>(null);
  // oxlint-disable-next-line react/refs -- reads props.isOpen, not a ref; React 19 passes ref as a prop, so the rule treats props as a ref
  const isSuspended = useSuspendedOverlayFocus(props.isOpen, overlay);
  return isSuspended ? null : (
    <HeroAlertDialog.Backdrop {...props} ref={mergeRefs(overlay, props.ref)} />
  );
}
export const AlertDialog = Object.assign(AlertDialogRoot, HeroAlertDialog, {
  Backdrop: AlertDialogBackdrop,
});
export type { AlertDialogProps } from "@heroui/react";
