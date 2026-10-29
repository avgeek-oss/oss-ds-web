"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SignIn } from "../sign-in.js";
import { AccessDenied } from "../access-denied.js";
import {
  accessDeniedStatus,
  type AuthRedirectErrorDetails,
} from "../auth-messages.js";
import {
  clearRedirectError,
  readRedirectError,
  useLeaving,
  useNavigate,
  type ConnectedBaseProps,
} from "./shared.js";

export type ConnectedSignInProps = ConnectedBaseProps & {
  brand: ReactNode;
  productName: string;
  providerName: string;
  providerIcon?: ReactNode;
  description?: ReactNode;
  /**
   * The path to return to after sign-in. Default: the page's `?returnTo=`
   * when it is a path on this origin, otherwise `/`.
   */
  returnTo?: string;
};

function returnToFromPage(): string {
  const value = new URLSearchParams(window.location.search).get("returnTo");
  // Only same-origin paths; auth-core refuses anything else anyway.
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

/**
 * The sign-in page: reads the callback's `?auth_error=`, shows access
 * denials on their own screen and other failures above the button, and
 * starts sign-in coming back to `returnTo`.
 */
export function ConnectedSignIn({
  client,
  navigate: navigateProp,
  brand,
  productName,
  providerName,
  providerIcon,
  description,
  returnTo,
}: ConnectedSignInProps) {
  const navigate = useNavigate(navigateProp);
  // Read after mount: the URL is not available while rendering on a server.
  const [page, setPage] = useState<{
    error: AuthRedirectErrorDetails | null;
    returnTo: string;
  } | null>(null);
  const read = useRef(false);
  useEffect(() => {
    // Once: the error leaves the URL as soon as it has been read.
    if (read.current) return;
    read.current = true;
    setPage({ error: readRedirectError(), returnTo: returnToFromPage() });
    clearRedirectError();
  }, []);
  const [isPending, setPending] = useLeaving();
  const start = () => {
    setPending(true);
    navigate(client.signInUrl(returnTo ?? page?.returnTo ?? "/"));
  };
  const denied = accessDeniedStatus(page?.error);
  if (denied)
    return (
      <AccessDenied
        brand={brand}
        productName={productName}
        providerName={providerName}
        status={denied}
        isPending={isPending}
        onTryAgain={start}
      />
    );
  return (
    <SignIn
      brand={brand}
      productName={productName}
      providerName={providerName}
      providerIcon={providerIcon}
      description={description}
      error={page?.error ?? null}
      isPending={isPending}
      onContinue={start}
    />
  );
}
