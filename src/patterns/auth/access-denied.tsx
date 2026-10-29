"use client";

import type { ReactNode } from "react";
import { Button } from "../../buttons/button.js";
import { TypographyParagraph } from "../../typography/typography.js";
import { AuthScreen } from "./auth-screen.js";
import type { AccessDeniedStatus } from "./auth-messages.js";

export {
  accessDeniedStatus,
  type AccessDeniedStatus,
} from "./auth-messages.js";

export type AccessDeniedProps = {
  brand: ReactNode;
  productName: string;
  providerName: string;
  /**
   * `unassigned` (default): the provider has not given the person this app.
   * `suspended`: they are known to the app but have no role.
   * `inactive`: the provider deactivated or removed them.
   */
  status?: AccessDeniedStatus;
  /** The account they signed in with, when the app knows it. */
  email?: string | null;
  /** Starts sign-in again, for after an admin has assigned access. */
  onTryAgain?: () => void;
  isPending?: boolean;
};

const copy: Record<
  AccessDeniedStatus,
  (names: { productName: string; providerName: string }) => {
    title: string;
    description: string;
  }
> = {
  unassigned: ({ productName, providerName }) => ({
    title: `No access to ${productName}`,
    description: `You don't have access to ${productName}. Ask an admin to assign it to you in ${providerName}.`,
  }),
  suspended: ({ productName, providerName }) => ({
    title: "Access suspended",
    description: `Your access to ${productName} is suspended because you have no role. Ask an admin to assign you one in ${providerName}.`,
  }),
  inactive: ({ productName, providerName }) => ({
    title: "Account not active",
    description: `Your account isn't active in ${productName}. Ask an admin to check it in ${providerName}.`,
  }),
};

export function AccessDenied({
  brand,
  productName,
  providerName,
  status = "unassigned",
  email,
  onTryAgain,
  isPending = false,
}: AccessDeniedProps) {
  const { title, description } = copy[status]({ productName, providerName });
  return (
    <AuthScreen brand={brand} title={title} description={description}>
      {email ? (
        <TypographyParagraph size="sm" color="muted">
          Signed in as{" "}
          <span className="font-medium text-foreground [overflow-wrap:anywhere]">
            {email}
          </span>
          .
        </TypographyParagraph>
      ) : null}
      {onTryAgain ? (
        <Button
          className="w-full"
          variant="secondary"
          isDisabled={isPending}
          isPending={isPending}
          onPress={onTryAgain}
        >
          {isPending ? "Redirecting…" : "Try again"}
        </Button>
      ) : null}
    </AuthScreen>
  );
}
