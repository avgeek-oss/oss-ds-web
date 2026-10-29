"use client";

import { useCallback, type ReactNode } from "react";
import type { ActiveSession } from "@avgeek-oss/auth-client";
import { QueryError, QueryLoading } from "../../feedback/query-state.js";
import { ProfileSettings } from "../../account-settings/profile-settings.js";
import {
  SessionsSettings,
  type Session,
} from "../../account-settings/sessions-settings.js";
import {
  authErrorCode,
  useConnectedList,
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

function deviceName(session: ActiveSession): string {
  if (session.browser && session.os)
    return `${session.browser} on ${session.os}`;
  return session.browser ?? session.os ?? "Unknown browser";
}

function toSession(session: ActiveSession): Session {
  return {
    id: session.id,
    name: deviceName(session),
    signedInAt: session.createdAt,
    lastActive: session.lastSeenAt,
    // It ends at the earlier of the two unless it is used again.
    expiresAt:
      Date.parse(session.idleExpiresAt) < Date.parse(session.expiresAt)
        ? session.idleExpiresAt
        : session.expiresAt,
    current: session.current,
  };
}

/**
 * The signed-in person's profile from the provider and their browser
 * sessions, newest first, with sign-out for each and everywhere. Ending
 * this browser's session goes on to the provider's logout URL.
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
  const sessions = useConnectedList<ActiveSession>(
    () => client.sessions.list(),
    "Could not load your sessions.",
  );
  const { update, refetch } = sessions;

  // This page is signed out: leave it as sign-out does.
  const signedOut = useCallback(
    (endSessionUrl: string | null) => navigate(endSessionUrl ?? signedOutUrl),
    [navigate, signedOutUrl],
  );
  const revoke = useCallback(
    async (id: string, previous: ActiveSession[]) => {
      // This page's row stays until the browser leaves.
      const own = previous.some((item) => item.id === id && item.current);
      if (!own) update((items) => items.filter((item) => item.id !== id));
      try {
        const result = await client.sessions.revoke(id);
        if (result.current || result.endSessionUrl)
          signedOut(result.endSessionUrl);
      } catch (error) {
        // Already ended elsewhere: the list was out of date.
        if (!own && authErrorCode(error) === "not_found") {
          void refetch();
          return;
        }
        update(() => previous);
        throw error;
      }
    },
    [client, refetch, signedOut, update],
  );

  if (state.status === "loading")
    return <QueryLoading>Loading your account…</QueryLoading>;
  if (state.status === "error")
    return <QueryError message={state.message} onRetry={() => void reload()} />;
  const { session } = state;
  const list = sessions.state;
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
      {list.status === "loading" ? (
        <QueryLoading>Loading your sessions…</QueryLoading>
      ) : list.status === "error" ? (
        <QueryError message={list.message} onRetry={sessions.retry} />
      ) : (
        <SessionsSettings
          items={list.items.map(toSession)}
          formatDate={formatDate}
          onSignOutCurrent={async () => {
            // SessionsSettings offers this on the current row only.
            const current = list.items.find((item) => item.current);
            if (current) await revoke(current.id, list.items);
            else signedOut(await client.signOut());
          }}
          onSignOut={(id) => revoke(id, list.items)}
          onSignOutEverywhere={async () => {
            const result = await client.sessions.signOutEverywhere();
            signedOut(result.endSessionUrl);
          }}
        />
      )}
    </div>
  );
}
