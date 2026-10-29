"use client";

import type { ReactNode } from "react";
import type { ConnectedApp } from "@avgeek-oss/auth-client";
import { QueryError, QueryLoading } from "../../feedback/query-state.js";
import { McpConnectionsSettings } from "../../account-settings/mcp-connections-settings.js";
import { useConnectedList, type ConnectedBaseProps } from "./shared.js";

export type ConnectedMcpConnectionsProps = Omit<
  ConnectedBaseProps,
  "navigate"
> & {
  formatDate: (value: string) => ReactNode;
  /** Describes a grant's app-defined restrictions, such as its workspace. */
  formatRestrictions?: (
    restrictions: Readonly<Record<string, unknown>> | null,
  ) => ReactNode;
};

/**
 * The MCP clients the signed-in person connected, with disconnect. A
 * disconnected app leaves the list at once and returns if the request
 * fails.
 */
export function ConnectedMcpConnections({
  client,
  formatDate,
  formatRestrictions,
}: ConnectedMcpConnectionsProps) {
  const apps = useConnectedList<ConnectedApp>(
    () => client.connectedApps.list(),
    "Could not load your connected apps.",
  );
  if (apps.state.status === "loading")
    return <QueryLoading>Loading connected apps…</QueryLoading>;
  if (apps.state.status === "error")
    return <QueryError message={apps.state.message} onRetry={apps.retry} />;
  const items = apps.state.items;
  return (
    <McpConnectionsSettings
      items={items}
      formatDate={formatDate}
      formatRestrictions={formatRestrictions}
      onRevoke={async (id) => {
        apps.update((current) => current.filter((item) => item.id !== id));
        try {
          await client.connectedApps.revoke(id);
        } catch (error) {
          apps.update(() => items);
          throw error;
        }
      }}
    />
  );
}
