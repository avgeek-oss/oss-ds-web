"use client";

import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import SecurityCheckIcon from "@hugeicons/core-free-icons/SecurityCheckIcon";
import { Button } from "../../buttons/button.js";
import { Dialog } from "../../overlays/dialog.js";

export type StepUpDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** The organisation's identity provider, such as "authentik". */
  providerName: string;
  /**
   * Why this action needs it, such as "Creating an admin API key needs a
   * recent sign-in."
   */
  reason?: ReactNode;
  /** True once step-up has started, while the browser navigates. */
  isPending?: boolean;
  /**
   * Sends the person to the provider to sign in again. The app navigates to
   * its step-up URL with the current page as `returnTo` and repeats the
   * action when they come back.
   */
  onContinue: () => void;
};

export function StepUpDialog({
  isOpen,
  onOpenChange,
  providerName,
  reason = "This action needs you to confirm it's you.",
  isPending = false,
  onContinue,
}: StepUpDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={() => onOpenChange(false)}
      title="Confirm it's you"
      size="sm"
      isDismissDisabled={isPending}
      footer={
        <>
          <Button
            variant="secondary"
            isDisabled={isPending}
            onPress={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            isDisabled={isPending}
            isPending={isPending}
            onPress={onContinue}
          >
            <HugeiconsIcon
              icon={SecurityCheckIcon}
              size={16}
              aria-hidden="true"
            />
            {isPending ? "Redirecting…" : `Continue with ${providerName}`}
          </Button>
        </>
      }
    >
      <div className="grid gap-3 text-sm">
        <p>{reason}</p>
        <p className="text-muted">
          You&apos;ll sign in again at {providerName}, with multi-factor
          authentication, and come back here to finish.
        </p>
      </div>
    </Dialog>
  );
}
