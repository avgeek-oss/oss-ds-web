/**
 * A failed sign-in or step-up as the auth callback reports it on the page's
 * URL. Structurally the same as `AuthRedirectError` from
 * `@avgeek-oss/auth-client`, so its `readAuthRedirectError` result can be
 * passed as is.
 */
export type AuthRedirectErrorDetails = {
  readonly code: string;
  readonly reason: string | null;
};

/** Names used in auth copy. */
export type AuthCopyNames = {
  /** The app, such as "Posted". */
  productName: string;
  /** The organisation's identity provider, such as "authentik" or "Google". */
  providerName: string;
};

/** Why a person cannot use the app. */
export type AccessDeniedStatus = "unassigned" | "suspended" | "inactive";

/**
 * The access state a `sign_in_denied` redirect error describes, or `null`
 * for any other error. `no_role` and `unassigned` both mean the person has
 * no role in the app; `user_inactive` and `user_deleted` mean the provider
 * deactivated or removed them.
 */
export function accessDeniedStatus(
  error: AuthRedirectErrorDetails | null | undefined,
): AccessDeniedStatus | null {
  if (error?.code !== "sign_in_denied") return null;
  return error.reason === "user_inactive" || error.reason === "user_deleted"
    ? "inactive"
    : "unassigned";
}

/**
 * A message that is safe to show for a redirect error. Unknown codes and
 * reasons get a general message.
 */
export function authRedirectErrorMessage(
  error: AuthRedirectErrorDetails,
  { productName, providerName }: AuthCopyNames,
): string {
  switch (error.code) {
    case "sign_in_denied":
      return accessDeniedStatus(error) === "inactive"
        ? `Your account isn't active in ${productName}. Ask an admin to check it in ${providerName}.`
        : `You don't have access to ${productName}. Ask an admin to assign it to you in ${providerName}.`;
    case "step_up_failed":
      switch (error.reason) {
        case "session":
          return "Your session changed while you were confirming. Sign in again.";
        case "user":
          return `You confirmed as a different person in ${providerName}. Sign in again as yourself.`;
        case "stale":
          return `${providerName} didn't ask you to sign in again. Try again.`;
        case "mfa_missing":
          return `Confirming needs multi-factor authentication in ${providerName}. Set it up there, then try again.`;
        default:
          return "We couldn't confirm it's you. Try again.";
      }
    case "oidc_unavailable":
      return `${providerName} isn't responding. Try again in a few minutes.`;
    case "oidc_transaction_invalid":
      return "Sign-in took too long or was started in another tab. Try again.";
    case "oidc_callback_invalid":
      return `${providerName} sent back a sign-in that couldn't be accepted. Try again.`;
    case "return_to_invalid":
      return `That sign-in link isn't valid. Start again from ${productName}.`;
    case "rate_limited":
      return "Too many sign-in attempts. Wait a moment, then try again.";
    case "unavailable":
      return "Sign-in is temporarily unavailable. Try again shortly.";
    default:
      return "Sign-in didn't complete. Try again.";
  }
}
