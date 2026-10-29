"use client";

import type { ReactNode } from "react";
import { QueryError, QueryLoading } from "../../feedback/query-state.js";
import { ProfileSettings } from "../../account-settings/profile-settings.js";
import { SessionsSettings } from "../../account-settings/sessions-settings.js";
import {
  useConnectedSession,
  useNavigate,
  type ConnectedBaseProps,
} from "./shared.js";

export type ConnectedAccountSettingsProps = ConnectedBaseProps & {
  providerName: string;
  formatDate: (value: string) => ReactNode;
  /** The provider's account page, opened in a new tab. */
  manageUrl?: string;
  avatarUrl?: string;
  /**
   * Where to go after signing out when the provider has no logout URL.
   * Default `/`.
   */
  signedOutUrl?: string;
};

/**
 * The signed-in person's profile from the provider and this browser's
 * session, with sign-out. The auth client lists no other sessions, so
 * there is no list of devices or "sign out everywhere" here yet.
 */
export function ConnectedAccountSettings({
  client,
  navigate: navigateProp,
  providerName,
  formatDate,
  manageUrl,
  avatarUrl,
  signedOutUrl = "/",
}: ConnectedAccountSettingsProps) {
  const navigate = useNavigate(navigateProp);
  const { state, reload } = useConnectedSession(client, navigate);
  if (state.status === "loading")
    return <QueryLoading>Loading your account…</QueryLoading>;
  if (state.status === "error")
    return <QueryError message={state.message} onRetry={() => void reload()} />;
  const { session } = state;
  return (
    <div className="grid gap-6">
      <ProfileSettings
        name={session.user.displayName}
        email={session.user.email}
        role={session.user.role}
        providerName={providerName}
        manageUrl={manageUrl}
        avatarUrl={avatarUrl}
      />
      <SessionsSettings
        items={[
          {
            id: "current",
            name: "This browser",
            signedInAt: session.session.authenticatedAt,
            lastActive: null,
            expiresAt: session.session.expiresAt,
            current: true,
          },
        ]}
        formatDate={formatDate}
        onSignOutCurrent={async () => {
          const logout = await client.signOut();
          navigate(logout ?? signedOutUrl);
        }}
      />
    </div>
  );
}
