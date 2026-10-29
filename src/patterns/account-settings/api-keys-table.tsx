"use client";

import type { ReactNode } from "react";
import {
  ResourceTable,
  ResourceName,
  type ResourceTableColumn,
} from "../resource-table.js";
import { StatusIndicator, type StatusDescriptor } from "../status-indicator.js";
import { actionColumn } from "../settings/table-actions.js";
import { mcpClientPresentation } from "../../utilities/mcp-client-presentation.js";
import {
  teamRoleOptions,
  type TeamRole,
} from "../team-settings/team-role-options.js";

/**
 * A personal API key, never with its secret. The same fields as `ApiKey`
 * from `@avgeek-oss/auth-client`, so its list can be passed as is.
 */
export type ApiKey = {
  readonly id: string;
  readonly name: string;
  /** The highest role the key acts with. */
  readonly ceiling: TeamRole;
  /** The workspace it was issued for, or `null`. */
  readonly workspace: string | null;
  readonly createdAt: string;
  /** `null` for a key that never expires. */
  readonly expiresAt: string | null;
  readonly lastUsedAt: string | null;
  /** The key that replaced this one in a rotation, or `null`. */
  readonly replacedBy: string | null;
  /** Until when a rotated key still works, or `null`. */
  readonly graceUntil: string | null;
};
export type ApiKeysTableProps<T extends ApiKey = ApiKey> = {
  items: T[];
  formatDate: (value: string) => ReactNode;
  actions: (item: T) => ReactNode;
  /**
   * Names a workspace id. The Workspace column is shown when a key has a
   * workspace.
   */
  workspaceLabel?: (workspace: string) => ReactNode;
  emptyDescription?: string;
};

export function roleLabel(role: TeamRole): string {
  return teamRoleOptions.find((option) => option.id === role)?.label ?? role;
}
function isPast(value: string | null) {
  return value !== null && Date.parse(value) <= Date.now();
}
/** Whether a key can still be used: not expired and not past its grace. */
export function isApiKeyUsable(key: ApiKey): boolean {
  if (isPast(key.expiresAt)) return false;
  return key.replacedBy === null || !isPast(key.graceUntil);
}

function roleColumn<T extends { ceiling: TeamRole }>(): ResourceTableColumn<T> {
  return {
    key: "role",
    header: "Role",
    className: "whitespace-nowrap",
    cell: (item) => roleLabel(item.ceiling),
  };
}
function lastUsedColumn<T extends { lastUsedAt: string | null }>(
  formatDate: (value: string) => ReactNode,
): ResourceTableColumn<T> {
  return {
    key: "last-used",
    header: "Last used",
    className: "whitespace-nowrap",
    cell: (item) => (item.lastUsedAt ? formatDate(item.lastUsedAt) : "Never"),
  };
}

export function ApiKeysTable<T extends ApiKey>({
  items,
  formatDate,
  actions,
  workspaceLabel = (workspace) => workspace,
  emptyDescription = "Create an API key for your scripts or apps.",
}: ApiKeysTableProps<T>) {
  const columns: ResourceTableColumn<T>[] = [
    {
      key: "name",
      isRowHeader: true,
      header: "Name",
      className: "min-w-60",
      cell: (item) => (
        <div className="grid gap-1">
          <ResourceName name={item.name} />
          {item.replacedBy !== null ? (
            <StatusIndicator
              className="w-fit"
              label={isPast(item.graceUntil) ? "Replaced" : "Rotating"}
              color={isPast(item.graceUntil) ? "default" : "warning"}
              description={
                item.graceUntil && !isPast(item.graceUntil)
                  ? "Replaced by a new key. This one keeps working until its grace period ends."
                  : "Replaced by a new key."
              }
            />
          ) : null}
        </div>
      ),
    },
    roleColumn<T>(),
  ];
  if (items.some((item) => item.workspace !== null))
    columns.push({
      key: "workspace",
      header: "Workspace",
      cell: (item) =>
        item.workspace === null ? "All" : workspaceLabel(item.workspace),
    });
  columns.push(
    {
      key: "added",
      header: "Added",
      className: "whitespace-nowrap",
      cell: (item) => formatDate(item.createdAt),
    },
    {
      key: "expires",
      header: "Expires",
      className: "whitespace-nowrap",
      cell: (item) => {
        // A rotated key stops at the end of its grace period.
        const end =
          item.replacedBy !== null && item.graceUntil !== null
            ? item.graceUntil
            : item.expiresAt;
        if (!end) return "No expiry";
        return (
          <div className="flex items-start gap-2">
            {formatDate(end)}
            {isPast(end) ? (
              <span className="text-xs/5 text-danger">Expired</span>
            ) : null}
          </div>
        );
      },
    },
    lastUsedColumn<T>(formatDate),
    actionColumn(actions),
  );
  return (
    <ResourceTable
      ariaLabel="API keys"
      mobileLayout="scroll"
      tableClassName="min-w-4xl"
      items={items}
      getRowKey={(item) => item.id}
      emptyTitle="No API keys"
      emptyDescription={emptyDescription}
      columns={columns}
    />
  );
}

/**
 * An MCP client the person connected. The same fields as `ConnectedApp`
 * from `@avgeek-oss/auth-client`, plus an optional app-supplied logo and
 * trust status.
 */
export type AuthorizedClient = {
  /** The grant id. */
  readonly id: string;
  readonly clientId: string;
  readonly clientName: string;
  readonly logoUri: string | null;
  /** The highest role the client acts with. */
  readonly ceiling: TeamRole;
  readonly resources: readonly string[];
  readonly restrictions: Readonly<Record<string, unknown>> | null;
  readonly createdAt: string;
  readonly lastUsedAt: string | null;
  readonly logo?: ReactNode;
  readonly trust?: StatusDescriptor;
};
export type AuthorizedClientsTableProps<
  T extends AuthorizedClient = AuthorizedClient,
> = {
  items: T[];
  formatDate: (value: string) => ReactNode;
  actions: (item: T) => ReactNode;
  /**
   * Describes a grant's app-defined restrictions, such as its workspace.
   * Adds a "Limited to" column when given.
   */
  formatRestrictions?: (
    restrictions: Readonly<Record<string, unknown>> | null,
  ) => ReactNode;
  emptyDescription?: string;
};

function ClientLogo({ client }: { client: AuthorizedClient }) {
  if (client.logo) return client.logo;
  if (!client.logoUri) return null;
  return (
    <img
      src={client.logoUri}
      alt=""
      referrerPolicy="no-referrer"
      className="size-5 rounded-sm object-contain"
    />
  );
}

export function AuthorizedClientsTable<T extends AuthorizedClient>({
  items,
  formatDate,
  actions,
  formatRestrictions,
  emptyDescription = "Connect an app by signing in from the app.",
}: AuthorizedClientsTableProps<T>) {
  const columns: ResourceTableColumn<T>[] = [
    {
      key: "client",
      isRowHeader: true,
      header: "App",
      className: "min-w-60",
      cell: (item) => {
        const client = mcpClientPresentation({
          name: item.clientName,
          id: item.clientId,
          logo:
            item.logo || item.logoUri ? (
              <ClientLogo client={item} />
            ) : undefined,
        });
        return (
          <div className="flex min-w-0 items-start gap-2">
            {client.logo ? (
              <span
                aria-hidden="true"
                className="shrink-0 [&_img]:size-5 [&_svg]:size-5"
              >
                {client.logo}
              </span>
            ) : null}
            <div className="grid gap-1">
              <ResourceName name={client.name} description={client.id} />
              {item.trust ? <StatusIndicator {...item.trust} /> : null}
            </div>
          </div>
        );
      },
    },
    roleColumn<T>(),
  ];
  if (formatRestrictions)
    columns.push({
      key: "restrictions",
      header: "Limited to",
      cell: (item) => formatRestrictions(item.restrictions),
    });
  columns.push(
    {
      key: "connected",
      header: "Connected",
      className: "whitespace-nowrap",
      cell: (item) => formatDate(item.createdAt),
    },
    lastUsedColumn<T>(formatDate),
    actionColumn(actions),
  );
  return (
    <ResourceTable
      ariaLabel="Connected apps"
      mobileLayout="scroll"
      tableClassName="min-w-3xl"
      items={items}
      getRowKey={(item) => item.id}
      emptyTitle="No connected apps yet"
      emptyDescription={emptyDescription}
      columns={columns}
    />
  );
}
