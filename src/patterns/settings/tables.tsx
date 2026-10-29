import type { ReactNode } from "react";
import { Chip } from "../../data-display/chip.js";
import { ResourceTable, ResourceName } from "../resource-table.js";
import { actionColumn, type Actions } from "./table-actions.js";

export {
  PeopleDirectory,
  type DirectoryPerson,
} from "../team-settings/people-directory.js";

/** A signed-in browser or device. */
export type Session = {
  id: string;
  /** The browser and device, such as "Safari on macOS". */
  name: string;
  /** Where it was last used from, such as a city or network. */
  detail?: string;
  signedInAt?: string;
  lastActive: string | null;
  expiresAt: string;
  /** This browser. */
  current: boolean;
};
export function SessionsTable({
  items,
  actions,
  formatDate,
}: {
  items: Session[];
  formatDate: (value: string) => ReactNode;
} & Actions<Session>) {
  return (
    <ResourceTable
      ariaLabel="Sessions"
      items={items}
      getRowKey={(item) => item.id}
      emptyTitle="No sessions"
      emptyDescription=""
      columns={[
        {
          key: "session",
          header: "Device",
          isRowHeader: true,
          cell: (item) => (
            <div className="grid gap-1">
              <ResourceName name={item.name} description={item.detail} />
              {item.current ? (
                <Chip size="sm" color="accent" className="w-fit">
                  This device
                </Chip>
              ) : null}
            </div>
          ),
        },
        {
          key: "signed-in",
          header: "Signed in",
          className: "whitespace-nowrap",
          cell: (item) => (item.signedInAt ? formatDate(item.signedInAt) : "—"),
        },
        {
          key: "last",
          header: "Last active",
          className: "whitespace-nowrap",
          cell: (item) => (item.lastActive ? formatDate(item.lastActive) : "—"),
        },
        {
          key: "expires",
          header: "Expires",
          className: "whitespace-nowrap",
          cell: (item) => formatDate(item.expiresAt),
        },
        actionColumn(actions),
      ]}
    />
  );
}
export {
  ApiKeysTable,
  AuthorizedClientsTable,
  type ApiKey,
  type ApiKeysTableProps,
  type AuthorizedClient,
  type AuthorizedClientsTableProps,
} from "../account-settings/api-keys-table.js";
