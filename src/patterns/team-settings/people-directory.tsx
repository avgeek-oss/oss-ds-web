"use client";

import type { ReactNode } from "react";
import { UserAvatar } from "../user-avatar.js";
import { StatusIndicator } from "../status-indicator.js";
import {
  ResourceTable,
  ResourceName,
  type ResourceTableColumn,
} from "../resource-table.js";
import { actionColumn } from "../settings/table-actions.js";
import { InlineExternalLink } from "../../navigation/inline-external-link.js";
import { teamRoleOptions, type TeamRole } from "./team-role-options.js";

/** Where a person's role was last set: sign-in claims, SCIM or an app admin. */
export type DirectoryRoleSource = "oidc" | "scim" | "admin";

/** A person mirrored from the identity provider. */
export type DirectoryPerson = {
  id: string;
  name: string | null;
  email: string | null;
  /** Their role in the app; `null` means suspended (no access). */
  role: TeamRole | null;
  roleSource?: DirectoryRoleSource | null;
  /** `false` when the provider deactivated them. */
  active?: boolean;
  lastSignInAt: string | null;
  avatarUrl?: string;
};

export type PeopleDirectoryProps<T extends DirectoryPerson = DirectoryPerson> =
  {
    items: T[];
    /** The organisation's identity provider, such as "authentik". */
    providerName: string;
    formatDate: (value: string) => ReactNode;
    /** Labels this person "(you)". */
    currentUserId?: string;
    /** Where admins manage access in the provider, opened in a new tab. */
    manageUrl?: string;
    /** Row actions, such as removing someone from a workspace. */
    actions?: (item: T) => ReactNode;
    /** Replaces the "Access is managed in" note, or `null` to omit it. */
    note?: ReactNode;
    emptyDescription?: string;
  };

const sourceLabels: Record<DirectoryRoleSource, string> = {
  oidc: "Sign-in",
  scim: "SCIM",
  admin: "App admin",
};

export function personName(person: DirectoryPerson): string {
  return person.name?.trim() || person.email || "Unnamed";
}

export function PeopleDirectory<T extends DirectoryPerson>({
  items,
  providerName,
  formatDate,
  currentUserId,
  manageUrl,
  actions,
  note,
  emptyDescription = `People appear here when ${providerName} gives them access.`,
}: PeopleDirectoryProps<T>) {
  const columns: ResourceTableColumn<T>[] = [
    {
      key: "person",
      header: "Person",
      isRowHeader: true,
      className: "min-w-56",
      cell: (item) => {
        const name = personName(item);
        return (
          <div className="flex min-w-0 items-center gap-2">
            <UserAvatar
              aria-hidden="true"
              email={item.email ?? ""}
              name={name}
              src={item.avatarUrl}
            />
            <div className="grid gap-1">
              <ResourceName
                name={item.id === currentUserId ? `${name} (you)` : name}
                description={item.email ?? undefined}
              />
              {item.active === false ? (
                <StatusIndicator
                  className="w-fit"
                  label="Deactivated"
                  color="danger"
                  description={`Deactivated in ${providerName}.`}
                />
              ) : item.role === null ? (
                <StatusIndicator
                  className="w-fit"
                  label="Suspended"
                  color="warning"
                  description={`No role, so no access. Assign one in ${providerName}.`}
                />
              ) : null}
            </div>
          </div>
        );
      },
    },
    {
      key: "role",
      header: "Role",
      className: "whitespace-nowrap",
      cell: (item) =>
        item.role === null
          ? "—"
          : (teamRoleOptions.find((role) => role.id === item.role)?.label ??
            item.role),
    },
    {
      key: "source",
      header: "Source",
      className: "whitespace-nowrap",
      cell: (item) => (item.roleSource ? sourceLabels[item.roleSource] : "—"),
    },
    {
      key: "last-sign-in",
      header: "Last sign-in",
      className: "whitespace-nowrap",
      cell: (item) =>
        item.lastSignInAt ? formatDate(item.lastSignInAt) : "Never",
    },
  ];
  if (actions) columns.push(actionColumn(actions));
  return (
    <div className="grid gap-4">
      {note === undefined ? (
        <p className="text-sm text-muted">
          Access is managed in {providerName}. Assign roles and app access
          there; changes appear here automatically.{" "}
          {manageUrl ? (
            <InlineExternalLink href={manageUrl}>
              Manage in {providerName}
            </InlineExternalLink>
          ) : null}
        </p>
      ) : (
        note
      )}
      <ResourceTable
        ariaLabel="People"
        mobileLayout="scroll"
        tableClassName="min-w-3xl"
        items={items}
        columns={columns}
        getRowKey={(item) => item.id}
        emptyTitle="No people yet"
        emptyDescription={emptyDescription}
      />
    </div>
  );
}
