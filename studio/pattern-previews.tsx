import { useState, type ReactNode } from "react";
import { Button } from "../src/buttons/button.js";
import { ApiKeysSettings } from "../src/patterns/account-settings/api-keys-settings.js";
import {
  ApiKeysTable,
  AuthorizedClientsTable,
  type ApiKey,
  type AuthorizedClient,
} from "../src/patterns/account-settings/api-keys-table.js";
import { CreateApiKeyDialog } from "../src/patterns/account-settings/create-api-key-dialog.js";
import { RotateApiKeyDialog } from "../src/patterns/account-settings/rotate-api-key-dialog.js";
import {
  PeopleDirectory,
  type DirectoryPerson,
} from "../src/patterns/team-settings/people-directory.js";
import { WorkspaceMembersSettings } from "../src/patterns/team-settings/workspace-members-settings.js";
import { HistoryTable } from "../src/patterns/history/history-table.js";
import { HistorySearch } from "../src/patterns/history/history-search.js";
import { HistoryFilter } from "../src/patterns/history/history-filter.js";
import {
  EventDetailsDialog,
  EventDetail,
} from "../src/patterns/history/event-details-dialog.js";
import {
  FilterDialog,
  type FilterCondition,
} from "../src/patterns/filters/filter-dialog.js";
import {
  NotificationDestinationsSettings,
  type NotificationDestination,
} from "../src/patterns/notification-settings/notification-destinations-settings.js";
import { AddNotificationDestinationDialog } from "../src/patterns/notification-settings/add-notification-destination-dialog.js";
import { IntegrationConnectionCard } from "../src/patterns/integrations/integration-connection-card.js";
import { OperationProgress } from "../src/patterns/operations/operation-progress.js";
import { ProgressChecklistItem } from "../src/patterns/operations/progress-checklist-item.js";
import { Accordion } from "../src/data-display/accordion.js";
import { ActionConfirmation } from "../src/patterns/actions/action-confirmation.js";
import { AsyncActionButton } from "../src/patterns/actions/async-action-button.js";
import {
  QueryError,
  QueryLoading,
} from "../src/patterns/feedback/query-state.js";
import { StatusIndicator } from "../src/patterns/status-indicator.js";
import { ChoiceField } from "../src/patterns/choice-field.js";
import {
  teamRoleOptions,
  type TeamRole,
} from "../src/patterns/team-settings/team-role-options.js";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
function Preview({ children }: { children: ReactNode }) {
  return <div className="grid min-w-0 gap-5 p-4 sm:p-6">{children}</div>;
}
function useScenario() {
  const [failure, setFailure] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [message, setMessage] = useState("");
  const run = async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (failure)
      throw new Error(
        "The request failed. Your changes have been kept. Try again.",
      );
    setMessage("Action completed");
  };
  return {
    empty,
    message,
    run,
    controls: (
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onPress={() => setFailure(!failure)}>
          {failure ? "Allow requests" : "Simulate failures"}
        </Button>
        <Button variant="secondary" onPress={() => setEmpty(!empty)}>
          {empty ? "Show data" : "Show empty state"}
        </Button>
        <span role="status" className="text-sm text-muted">
          {message}
        </span>
      </div>
    ),
  };
}

const primaryKey: ApiKey = {
  id: "deploy-key",
  name: "Release automation",
  ceiling: "admin",
  workspace: null,
  createdAt: "2026-09-01T10:00:00Z",
  lastUsedAt: "2026-10-06T10:00:00Z",
  expiresAt: "2026-12-01T10:00:00Z",
  replacedBy: null,
  graceUntil: null,
};
const keys: ApiKey[] = [
  primaryKey,
  {
    id: "read-key",
    name: "Read-only reporting",
    ceiling: "viewer",
    workspace: "ops",
    createdAt: "2026-09-12T10:00:00Z",
    expiresAt: null,
    lastUsedAt: null,
    replacedBy: null,
    graceUntil: null,
  },
  {
    id: "old-key",
    name: "Nightly export",
    ceiling: "member",
    workspace: null,
    createdAt: "2026-06-01T10:00:00Z",
    expiresAt: "2027-06-01T10:00:00Z",
    lastUsedAt: "2026-10-05T02:00:00Z",
    replacedBy: "new-key",
    graceUntil: "2099-01-01T00:00:00Z",
  },
  {
    id: "expired-key",
    name: "Spring migration",
    ceiling: "member",
    workspace: null,
    createdAt: "2026-03-01T10:00:00Z",
    expiresAt: "2026-04-01T10:00:00Z",
    lastUsedAt: "2026-03-30T10:00:00Z",
    replacedBy: null,
    graceUntil: null,
  },
];
const workspaceNames: Record<string, string> = { ops: "Operations" };
export function ApiKeysSettingsPreview() {
  const scenario = useScenario();
  const [items, setItems] = useState(keys);
  return (
    <Preview>
      {scenario.controls}
      <ApiKeysSettings
        items={scenario.empty ? [] : items}
        formatDate={formatDate}
        workspaceLabel={(id) => workspaceNames[id] ?? id}
        onRotate={async (id, graceSeconds) => {
          await scenario.run();
          setItems((items) => [
            {
              ...primaryKey,
              id: `rotated-${Date.now()}`,
              name: items.find((item) => item.id === id)?.name ?? "Key",
              createdAt: new Date().toISOString(),
              lastUsedAt: null,
            },
            ...items.map((item) =>
              item.id === id
                ? {
                    ...item,
                    replacedBy: "rotated",
                    graceUntil: new Date(
                      Date.now() + graceSeconds * 1000,
                    ).toISOString(),
                  }
                : item,
            ),
          ]);
          return { key: "demo-rotated-key-save-once" };
        }}
        onRevoke={async (id) => {
          await scenario.run();
          setItems((items) => items.filter((item) => item.id !== id));
        }}
      />
    </Preview>
  );
}
export function ApiKeysTablePreview() {
  const scenario = useScenario();
  return (
    <Preview>
      {scenario.controls}
      <ApiKeysTable
        items={scenario.empty ? [] : keys}
        formatDate={formatDate}
        workspaceLabel={(id) => workspaceNames[id] ?? id}
        actions={() => <Button variant="secondary">Details</Button>}
      />
    </Preview>
  );
}
const clients: AuthorizedClient[] = [
  {
    id: "grant-codex",
    clientId: "https://chatgpt.com/oauth/codex/client.json",
    clientName: "Codex",
    logoUri: null,
    ceiling: "member",
    resources: ["https://api.example.test/mcp"],
    restrictions: null,
    createdAt: "2026-10-01T12:00:00Z",
    lastUsedAt: "2026-10-06T09:30:00Z",
  },
  {
    id: "grant-client",
    clientId: "https://client.example.test/oauth/client.json",
    clientName: "Example desktop client",
    logoUri: null,
    ceiling: "viewer",
    resources: ["https://api.example.test/mcp"],
    restrictions: { workspace: "ops" },
    createdAt: "2026-10-02T12:00:00Z",
    lastUsedAt: null,
    trust: {
      label: "Unverified",
      color: "warning",
      description: "Review the client before authorizing access.",
    },
  },
];
export function AuthorizedClientsPreview() {
  const scenario = useScenario();
  const [items, setItems] = useState(clients);
  return (
    <Preview>
      {scenario.controls}
      <AuthorizedClientsTable
        items={scenario.empty ? [] : items}
        formatDate={formatDate}
        formatRestrictions={(restrictions) =>
          typeof restrictions?.workspace === "string"
            ? (workspaceNames[restrictions.workspace] ?? restrictions.workspace)
            : "All workspaces"
        }
        actions={(item) => (
          <AsyncActionButton
            variant="danger"
            confirmation={{
              title: "Disconnect this app?",
              description:
                "It loses access at once. Connect it again from the app to reconnect.",
              confirmLabel: "Disconnect",
            }}
            onAction={async () => {
              await scenario.run();
              setItems((items) =>
                items.filter((client) => client.id !== item.id),
              );
            }}
          >
            Disconnect
          </AsyncActionButton>
        )}
      />
    </Preview>
  );
}
export function CreateApiKeyPreview({
  workspaces = false,
}: {
  workspaces?: boolean;
}) {
  const scenario = useScenario();
  const [isOpen, setOpen] = useState(false);
  return (
    <Preview>
      {scenario.controls}
      <Button onPress={() => setOpen(true)}>Create API key</Button>
      <CreateApiKeyDialog
        isOpen={isOpen}
        onOpenChange={setOpen}
        ceilings={["viewer", "member"]}
        workspaces={
          workspaces
            ? [
                { id: "ops", label: "Operations" },
                { id: "fleet", label: "Fleet" },
              ]
            : undefined
        }
        onCreate={async () => {
          await scenario.run();
          return { key: "demo-preview-key-save-once" };
        }}
      />
    </Preview>
  );
}
export function RotateApiKeyPreview() {
  const scenario = useScenario();
  const [isOpen, setOpen] = useState(false);
  return (
    <Preview>
      {scenario.controls}
      <Button onPress={() => setOpen(true)}>Rotate key</Button>
      <RotateApiKeyDialog
        isOpen={isOpen}
        onOpenChange={setOpen}
        apiKey={primaryKey}
        onRotate={async () => {
          await scenario.run();
          return { key: "demo-rotated-key-save-once" };
        }}
      />
    </Preview>
  );
}
export const people: DirectoryPerson[] = [
  {
    id: "ada",
    name: "Ada Lovelace",
    email: "ada@example.test",
    role: "admin",
    roleSource: "scim",
    lastSignInAt: "2026-10-06T08:12:00Z",
  },
  {
    id: "sam",
    name: "Sam Chen",
    email: "sam@example.test",
    role: "member",
    roleSource: "scim",
    lastSignInAt: "2026-10-04T16:40:00Z",
  },
  {
    id: "lee",
    name: "Lee Okafor",
    email: "lee@example.test",
    role: null,
    roleSource: "scim",
    lastSignInAt: "2026-09-20T11:00:00Z",
  },
  {
    id: "kim",
    name: null,
    email: "kim@example.test",
    role: "viewer",
    roleSource: "oidc",
    active: false,
    lastSignInAt: null,
  },
];
export function PeopleDirectoryPreview() {
  const scenario = useScenario();
  return (
    <Preview>
      {scenario.controls}
      <PeopleDirectory
        items={scenario.empty ? [] : people}
        providerName="authentik"
        manageUrl="https://auth.example.test/if/admin/"
        currentUserId="ada"
        formatDate={formatDate}
      />
    </Preview>
  );
}
export function WorkspaceMembersPreview() {
  const scenario = useScenario();
  const [memberIds, setMemberIds] = useState(["ada", "sam"]);
  return (
    <Preview>
      {scenario.controls}
      <WorkspaceMembersSettings
        workspaceName="Operations"
        providerName="authentik"
        members={
          scenario.empty
            ? []
            : people.filter((person) => memberIds.includes(person.id))
        }
        people={[
          ...people,
          {
            id: "noor",
            name: "Noor Haddad",
            email: "noor@example.test",
            role: "member",
            roleSource: "scim",
            lastSignInAt: null,
          },
        ]}
        currentUserId="ada"
        formatDate={formatDate}
        onAdd={async (id) => {
          await scenario.run();
          setMemberIds((ids) => [...ids, id]);
        }}
        onRemove={async (id) => {
          await scenario.run();
          setMemberIds((ids) => ids.filter((item) => item !== id));
        }}
      />
    </Preview>
  );
}
export function HistoryPreview() {
  const scenario = useScenario();
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  return (
    <Preview>
      {scenario.controls}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onPress={() => setRefreshing(!refreshing)}>
          Toggle refresh
        </Button>
        <Button variant="secondary" onPress={() => setLoading(!loading)}>
          Toggle loading
        </Button>
        <Button variant="secondary" onPress={() => setError(!error)}>
          Toggle error
        </Button>
      </div>
      <HistoryTable
        label="Audit events"
        items={
          scenario.empty
            ? []
            : [
                {
                  id: "event",
                  event: page === 1 ? "Member invited" : "API key revoked",
                  actor: "Alex Taylor",
                  at: "2026-10-06T10:00:00Z",
                },
              ]
        }
        columns={[
          { key: "event", header: "Event", cell: (item) => item.event },
          { key: "actor", header: "Actor", cell: (item) => item.actor },
          { key: "time", header: "Time", cell: (item) => formatDate(item.at) },
        ]}
        emptyDescription="Team activity will appear here."
        pagination={{ page, hasNextPage: page < 3, onPageChange: setPage }}
        isRefreshing={refreshing}
        isLoading={loading}
        error={error ? "Could not load history" : undefined}
        onRetry={() => setError(false)}
      />
    </Preview>
  );
}
export function HistorySearchPreview({
  initialSearch = "",
}: {
  initialSearch?: string;
}) {
  const [value, setValue] = useState(initialSearch);
  return (
    <Preview>
      <HistorySearch
        label="Search events"
        placeholder="Search by event or actor"
        value={value}
        onSearch={setValue}
      />
      <p role="status">Search: {value || "All events"}</p>
      <Button
        variant="secondary"
        className="w-fit"
        onPress={() => setValue("")}
      >
        Show all events
      </Button>
    </Preview>
  );
}
export function HistoryFilterPreview() {
  const [value, setValue] = useState("");
  return (
    <Preview>
      <div className="max-w-sm">
        <HistoryFilter
          label="Actors"
          value={value}
          onChange={setValue}
          searchPlaceholder="Search actors…"
          options={[
            { id: "alex", label: "Alex Taylor", trailing: "Admin" },
            { id: "sam", label: "Sam Chen", trailing: "Member" },
          ]}
        />
      </div>
    </Preview>
  );
}
export function EventDetailsPreview() {
  const [isOpen, setOpen] = useState(false);
  return (
    <Preview>
      <Button onPress={() => setOpen(true)}>View event</Button>
      <EventDetailsDialog
        isOpen={isOpen}
        onOpenChange={setOpen}
        title="Member invited"
        fields={[
          { id: "actor", label: "Actor", value: "Alex Taylor" },
          { id: "email", label: "Invited email", value: "sam@example.test" },
          {
            id: "request",
            label: "Request ID",
            value: "req_demo_0000000000000000000000001",
            copy: true,
          },
          {
            id: "detail",
            label: "Details",
            value: "A new invitation was sent with the Member role.",
          },
        ]}
      />
    </Preview>
  );
}
export function FilterPreview() {
  const scenario = useScenario();
  const [value, setValue] = useState<
    FilterCondition<"status" | "path", "in" | "contains">[]
  >([]);
  return (
    <Preview>
      {scenario.controls}
      <FilterDialog
        value={value}
        onChange={setValue}
        fields={[
          {
            field: "status",
            label: "Response status",
            searchable: true,
            operators: [{ value: "in", label: "Is one of", multiple: true }],
          },
          {
            field: "path",
            label: "Path",
            placeholder: "/api/",
            operators: [{ value: "contains", label: "Contains" }],
          },
        ]}
        getOptions={async (_field, search) => {
          await scenario.run();
          return ["200", "400", "404", "500"].filter((value) =>
            value.includes(search),
          );
        }}
      />
      <pre className="whitespace-pre-wrap break-words text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </Preview>
  );
}
const destination: NotificationDestination = {
  id: "channel",
  label: "#operations",
  description: "Slack channel C12345678",
  subscriptions: { deployments: "all", backups: "all", incidents: "off" },
};
export function NotificationDestinationsPreview() {
  const scenario = useScenario();
  const [items, setItems] = useState([destination]);
  return (
    <Preview>
      {scenario.controls}
      <NotificationDestinationsSettings
        items={scenario.empty ? [] : items}
        categories={[
          {
            id: "deployments",
            label: "Deployments",
            modes: ["off", "all", "failures"],
          },
          { id: "backups", label: "Backup & Restore", modes: ["off", "all"] },
          { id: "incidents", label: "Incidents", modes: ["off", "all"] },
        ]}
        onSubscriptionChange={async (row, category, mode) => {
          await scenario.run();
          setItems((items) =>
            items.map((item) =>
              item.id === row.id
                ? {
                    ...item,
                    subscriptions: { ...item.subscriptions, [category]: mode },
                  }
                : item,
            ),
          );
        }}
        onTest={scenario.run}
        onRemove={async (row) => {
          await scenario.run();
          setItems((items) => items.filter((item) => item.id !== row.id));
        }}
      />
    </Preview>
  );
}
export function AddDestinationPreview() {
  const scenario = useScenario();
  const [isOpen, setOpen] = useState(false);
  return (
    <Preview>
      {scenario.controls}
      <Button onPress={() => setOpen(true)}>Add channel</Button>
      <AddNotificationDestinationDialog
        isOpen={isOpen}
        onOpenChange={setOpen}
        title="Add Slack channel"
        fields={[
          {
            name: "channelId",
            label: "Channel ID",
            required: true,
            pattern: "[A-Z][A-Z0-9]{1,79}",
            maxLength: 80,
            placeholder: "C12345678",
          },
        ]}
        onAdd={scenario.run}
      />
    </Preview>
  );
}
export function IntegrationConnectionPreview() {
  const scenario = useScenario();
  const [connected, setConnected] = useState(true);
  return (
    <Preview>
      {scenario.controls}
      <IntegrationConnectionCard
        provider={{ name: "GitLab" }}
        connection={
          connected && !scenario.empty
            ? {
                id: "account",
                status: { label: "Connected", color: "success" },
                details: [
                  { id: "account", label: "Account", value: "Alex Taylor" },
                  {
                    id: "identity",
                    label: "Identity",
                    value: "alex@example.test",
                  },
                  { id: "auth", label: "Authorization", value: "OAuth 2.0" },
                ],
              }
            : null
        }
        emptyDescription="Authorize access to the repositories used by your team."
        disconnectDescription="Existing repositories will stop syncing and cannot deploy until the connection is authorized again."
        onConnect={async () => {
          await scenario.run();
          setConnected(true);
        }}
        onReauthorize={scenario.run}
        onDisconnect={async () => {
          await scenario.run();
          setConnected(false);
        }}
      />
    </Preview>
  );
}
export function OperationProgressPreview() {
  return (
    <Preview>
      <OperationProgress
        steps={[
          {
            id: "checkout",
            title: "Check out repository",
            description: "Completed in 2 seconds",
            status: "succeeded",
            children: (
              <p className="text-sm text-muted">Checked out commit a1b2c3d.</p>
            ),
          },
          {
            id: "build",
            title: "Build application",
            description: "The build command failed.",
            status: "failed",
            children: (
              <p className="text-sm text-danger-soft-foreground">
                Could not find the configured build command.
              </p>
            ),
          },
          {
            id: "deploy",
            title: "Start application",
            description: "Waiting for the build to finish.",
            status: "waiting",
          },
          {
            id: "health",
            title: "Health checks",
            description: "Checking the application endpoint…",
            status: "running",
            children: (
              <p className="text-sm text-muted">
                Waiting for a healthy response.
              </p>
            ),
          },
          {
            id: "cleanup",
            title: "Cleanup",
            description: "No cleanup required",
            status: "skipped",
          },
          {
            id: "cancelled",
            title: "Previous operation",
            description: "Cancelled by the user",
            status: "cancelled",
          },
        ]}
      />
    </Preview>
  );
}
export function ProgressChecklistItemPreview() {
  return (
    <Preview>
      <Accordion allowsMultipleExpanded>
        <ProgressChecklistItem
          id="build"
          title="Build application"
          description="The build command failed."
          status="failed"
        >
          <p className="text-sm text-danger-soft-foreground">
            Review the build configuration and retry.
          </p>
        </ProgressChecklistItem>
      </Accordion>
    </Preview>
  );
}
export function ActionConfirmationPreview() {
  const scenario = useScenario();
  const [isOpen, setOpen] = useState(false);
  return (
    <Preview>
      {scenario.controls}
      <Button variant="danger" onPress={() => setOpen(true)}>
        Remove member
      </Button>
      <ActionConfirmation
        isOpen={isOpen}
        onOpenChange={setOpen}
        title="Remove member?"
        description="Their access to this team will be removed immediately."
        confirmLabel="Remove member"
        onConfirm={scenario.run}
      />
    </Preview>
  );
}
export function AsyncActionButtonPreview() {
  const scenario = useScenario();
  return (
    <Preview>
      {scenario.controls}
      <div>
        <AsyncActionButton onAction={scenario.run}>
          Save changes
        </AsyncActionButton>
      </div>
    </Preview>
  );
}
export function QueryErrorPreview() {
  const [retry, setRetry] = useState(0);
  return (
    <Preview>
      <QueryError
        message="Could not load this page."
        onRetry={() => setRetry(retry + 1)}
      />
      <p role="status">Retries: {retry}</p>
    </Preview>
  );
}
export function QueryLoadingPreview() {
  return (
    <Preview>
      <QueryLoading>Loading account settings…</QueryLoading>
    </Preview>
  );
}
export function StatusIndicatorPreview() {
  return (
    <Preview>
      <div className="flex flex-wrap gap-3">
        <StatusIndicator
          label="Active"
          color="success"
          description="The account is ready to use."
        />
        <StatusIndicator label="Pending" color="warning" />
        <StatusIndicator label="Failed" color="danger" />
        <StatusIndicator label="Connected" color="accent" />
      </div>
    </Preview>
  );
}
export function ChoiceFieldPreview() {
  const [value, setValue] = useState<TeamRole>("member");
  return (
    <Preview>
      <div className="max-w-sm">
        <ChoiceField
          label="Role"
          value={value}
          onChange={setValue}
          options={teamRoleOptions}
        />
      </div>
    </Preview>
  );
}

export function EventDetailPreview() {
  return (
    <Preview>
      <dl>
        <EventDetail
          label="Request ID"
          value="req_demo_0000000000000000000000001"
          copy
        />
      </dl>
    </Preview>
  );
}
