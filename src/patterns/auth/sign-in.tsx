"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Login01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "../../buttons/button.js";
import { Alert } from "../../feedback/alert.js";
import { AuthScreen } from "./auth-screen.js";
import {
  authRedirectErrorMessage,
  type AuthRedirectErrorDetails,
} from "./auth-messages.js";

export {
  authRedirectErrorMessage,
  type AuthCopyNames,
  type AuthRedirectErrorDetails,
} from "./auth-messages.js";

export type SignInProps = {
  brand: ReactNode;
  /** The app, used in the description and error messages. */
  productName: string;
  /** The organisation's identity provider, such as "authentik". */
  providerName: string;
  /** A decorative 16px provider logo; the sign-in icon by default. */
  providerIcon?: ReactNode;
  description?: ReactNode;
  /**
   * The failed sign-in the callback reported, for example
   * `readAuthRedirectError(location.href)`. Shown above the button.
   */
  error?: AuthRedirectErrorDetails | null;
  /** True while the app is starting sign-in, such as before navigating. */
  isPending?: boolean;
  /**
   * Starts sign-in at the provider. The app navigates to its sign-in URL
   * with the page to return to, for example
   * `location.assign(client.signInUrl(returnTo))`.
   */
  onContinue: () => void;
};

export function SignIn({
  brand,
  productName,
  providerName,
  providerIcon,
  description,
  error,
  isPending = false,
  onContinue,
}: SignInProps) {
  // Navigation to the provider takes a moment; ignore repeated presses.
  const [started, setStarted] = useState(false);
  const pending = isPending || started;
  useEffect(() => {
    // Back from the provider through the browser's history cache.
    const restored = (event: PageTransitionEvent) => {
      if (event.persisted) setStarted(false);
    };
    window.addEventListener("pageshow", restored);
    return () => window.removeEventListener("pageshow", restored);
  }, []);
  return (
    <AuthScreen
      brand={brand}
      title="Sign in"
      description={
        description ??
        `Sign in to ${productName} with your ${providerName} account.`
      }
    >
      {error ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Sign-in didn't complete</Alert.Title>
            <Alert.Description>
              {authRedirectErrorMessage(error, { productName, providerName })}
            </Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}
      <Button
        className="w-full"
        isDisabled={pending}
        isPending={pending}
        onPress={() => {
          if (pending) return;
          setStarted(true);
          onContinue();
        }}
      >
        {providerIcon ?? (
          <HugeiconsIcon aria-hidden icon={Login01Icon} size={16} />
        )}
        {pending ? "Redirecting…" : `Continue with ${providerName}`}
      </Button>
    </AuthScreen>
  );
}
