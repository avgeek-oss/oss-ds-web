"use client";

import type { ComponentProps, ReactNode } from "react";
import { Modal } from "./modal.js";
import { useOverlaySuspension } from "./overlay-suspension.js";

export type DialogProps = Omit<
  ComponentProps<typeof Modal.Dialog>,
  "children" | "title"
> & {
  open: boolean;
  /** Called when the user dismisses the dialog; the app closes it. */
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Uses the large container unless `size` is set. */
  wide?: boolean;
  size?: ComponentProps<typeof Modal.Container>["size"];
  scroll?: ComponentProps<typeof Modal.Container>["scroll"];
  /** Disables the close button, Escape and outside presses, such as during a request. */
  isDismissDisabled?: boolean;
};

/**
 * A titled modal with a close button, body and optional footer. While an
 * `OverlaySuspensionScope` suspends it, the native modal unmounts and
 * dismissal is ignored; the app's `open` state is kept.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  wide = false,
  size,
  scroll = "inside",
  isDismissDisabled = false,
  ...props
}: DialogProps) {
  const { isSuspended } = useOverlaySuspension();
  return (
    <Modal.Backdrop
      isOpen={open}
      isDismissable={!isDismissDisabled}
      isKeyboardDismissDisabled={isDismissDisabled}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isSuspended && !isDismissDisabled) onClose();
      }}
    >
      <Modal.Container size={size ?? (wide ? "lg" : "md")} scroll={scroll}>
        <Modal.Dialog {...props}>
          <Modal.Header>
            <Modal.Heading>{title}</Modal.Heading>
            <Modal.CloseTrigger isDisabled={isDismissDisabled} />
          </Modal.Header>
          <Modal.Body>{children}</Modal.Body>
          {footer ? <Modal.Footer>{footer}</Modal.Footer> : null}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
