import { useState, type ReactNode } from "react";
import { Button } from "../src/buttons/button.js";
import { EmailChangeSettings } from "../src/patterns/account-settings/email-change-settings.js";
import { PasswordChangeSettings } from "../src/patterns/account-settings/password-change-settings.js";
import { ApiKeysSettings } from "../src/patterns/account-settings/api-keys-settings.js";
import {
  ApiKeysTable,
  AuthorizedClientsTable,
  type ApiKey,
  type AuthorizedClient,
} from "../src/patterns/account-settings/api-keys-table.js";
import { CreateApiKeyDialog } from "../src/patterns/account-settings/create-api-key-dialog.js";
import {
  MembersTable,
  type Member,
} from "../src/patterns/team-settings/members-table.js";
import {
  InvitationsTable,
  type Invitation,
} from "../src/patterns/team-settings/invitations-table.js";
import { InviteMemberDialog } from "../src/patterns/team-settings/invite-member-dialog.js";
import { MemberEditDialog } from "../src/patterns/team-settings/member-edit-dialog.js";
import { AddMemberDialog } from "../src/patterns/team-settings/add-member-dialog.js";
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

export const roles = [
  {
    id: "admin",
    label: "Admin",
    description: "Manage the team and its resources.",
  },
  {
    id: "member",
    label: "Member",
    description: "Work with the resources shared with your team.",
  },
  {
    id: "viewer",
    label: "Viewer",
    description: "View resources without making changes.",
  },
];
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

export function EmailChangePreview() {
  const scenario = useScenario();
  const [verified, setVerified] = useState(false);
  const [pending, setPending] = useState<{
    email: string;
    expiresAt: string;
  } | null>(null);
  const [resendAvailableAt, setResendAvailableAt] = useState(0);
  return (
    <Preview>
      {scenario.controls}
      <Button variant="secondary" onPress={() => setVerified(!verified)}>
        Toggle verified
      </Button>
      <EmailChangeSettings
        email="alex@example.test"
        isVerified={verified}
        pendingChange={pending}
        formatDate={formatDate}
        resendAvailableAt={resendAvailableAt}
        onRequestChange={async (email) => {
          await scenario.run();
          setPending({ email, expiresAt: "2026-10-06T15:00:00Z" });
        }}
        onCancelChange={async () => {
          await scenario.run();
          setPending(null);
        }}
        onResendVerification={async () => {
          await scenario.run();
          setResendAvailableAt(Date.now() + 60000);
        }}
      />
    </Preview>
  );
}
export function PasswordChangePreview() {
  const scenario = useScenario();
  const [required, setRequired] = useState(true);
  return (
    <Preview>
      {scenario.controls}
      <Button variant="secondary" onPress={() => setRequired(!required)}>
        Toggle current password requirement
      </Button>
      <PasswordChangeSettings
        requireCurrentPassword={required}
        onChangePassword={scenario.run}
      />
    </Preview>
  );
}
const primaryKey: ApiKey = {
  id: "deploy-key",
  name: "Release automation",
  tokenHint: "key_••••9a2f",
  permissions: "Administrative",
  createdAt: "2026-09-01T10:00:00Z",
  lastUsedAt: "2026-10-06T10:00:00Z",
  expiresAt: "2026-12-01T10:00:00Z",
};
const keys: ApiKey[] = [
  primaryKey,
  {
    id: "read-key",
    name: "Read-only reporting",
    permissions: "Read-only",
    expiresAt: null,
    lastUsedAt: null,
  },
];
export function ApiKeysSettingsPreview() {
  const scenario = useScenario();
  const [items, setItems] = useState(keys);
  return (
    <Preview>
      {scenario.controls}
      <ApiKeysSettings
        items={scenario.empty ? [] : items}
        formatDate={formatDate}
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
        actions={() => <Button variant="secondary">Details</Button>}
      />
    </Preview>
  );
}
const clients: AuthorizedClient[] = [
  {
    ...primaryKey,
    id: "client",
    client: {
      name: "Example desktop client",
      id: "https://client.example.test",
      trust: {
        label: "Unverified",
        color: "warning",
        description: "Review the client before authorizing access.",
      },
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
        actions={(item) => (
          <AsyncActionButton
            variant="danger"
            confirmation={{
              title: "Revoke connection?",
              description:
                "This app will lose access immediately. Sign in again from the app to reconnect.",
              confirmLabel: "Revoke connection",
            }}
            onAction={async () => {
              await scenario.run();
              setItems((items) =>
                items.filter((client) => client.id !== item.id),
              );
            }}
          >
            Revoke
          </AsyncActionButton>
        )}
      />
    </Preview>
  );
}
export function CreateApiKeyPreview() {
  const scenario = useScenario();
  const [isOpen, setOpen] = useState(false);
  return (
    <Preview>
      {scenario.controls}
      <Button onPress={() => setOpen(true)}>Create API key</Button>
      <CreateApiKeyDialog
        isOpen={isOpen}
        onOpenChange={setOpen}
        onCreate={async () => {
          await scenario.run();
          return { token: "demo-preview-key-save-once" };
        }}
      />
    </Preview>
  );
}
const member: Member = {
  id: "alex",
  name: "Alex Taylor",
  email: "alex@example.test",
  role: "member",
  accountStatus: { label: "Active", color: "success" },
  securityStatus: { label: "Enabled", color: "success" },
};
export function MembersPreview() {
  const scenario = useScenario();
  return (
    <Preview>
      {scenario.controls}
      <MembersTable
        items={
          scenario.empty
            ? []
            : [
                member,
                {
                  ...member,
                  id: "sam",
                  name: "Sam Chen",
                  email: "sam@example.test",
                  role: "viewer",
                  accountStatus: {
                    label: "Password setup pending",
                    color: "warning",
                  },
                  securityStatus: { label: "Not enabled", color: "warning" },
                },
              ]
        }
        roles={roles}
        actions={() => <Button variant="secondary">Edit</Button>}
      />
    </Preview>
  );
}
export function InvitationsPreview() {
  const scenario = useScenario();
  const [items, setItems] = useState<Invitation[]>([
    {
      id: "invite",
      email: "sam@example.test",
      role: "member",
      expiresAt: "2026-10-13T10:00:00Z",
    },
  ]);
  return (
    <Preview>
      {scenario.controls}
      <InvitationsTable
        items={scenario.empty ? [] : items}
        roles={roles}
        formatDate={formatDate}
        onCopyLink={async () => {
          await navigator.clipboard.writeText(
            "https://example.test/invite/demo",
          );
        }}
        onResend={scenario.run}
        onRevoke={async (item) => {
          await scenario.run();
          setItems((items) => items.filter((row) => row.id !== item.id));
        }}
      />
    </Preview>
  );
}
export function InviteMemberPreview() {
  const scenario = useScenario();
  const [isOpen, setOpen] = useState(false);
  return (
    <Preview>
      {scenario.controls}
      <Button onPress={() => setOpen(true)}>Create invitation</Button>
      <InviteMemberDialog
        isOpen={isOpen}
        onOpenChange={setOpen}
        roles={roles}
        resultGuidance={
          <p>Email delivery is not configured. Share the link privately.</p>
        }
        onInvite={async () => {
          await scenario.run();
          return { inviteUrl: "https://example.test/invite/demo" };
        }}
      />
    </Preview>
  );
}
export function MemberEditPreview({
  mode = "identity-and-role",
}: {
  mode?: "identity-and-role" | "role-only";
}) {
  const scenario = useScenario();
  const [isOpen, setOpen] = useState(false);
  return (
    <Preview>
      {scenario.controls}
      <Button onPress={() => setOpen(true)}>Edit member</Button>
      <MemberEditDialog
        isOpen={isOpen}
        onOpenChange={setOpen}
        member={member}
        roles={roles}
        mode={mode}
        onSave={scenario.run}
      />
    </Preview>
  );
}
export function AddMemberPreview() {
  const scenario = useScenario();
  const [isOpen, setOpen] = useState(false);
  return (
    <Preview>
      {scenario.controls}
      <Button onPress={() => setOpen(true)}>Add user</Button>
      <AddMemberDialog
        isOpen={isOpen}
        onOpenChange={setOpen}
        roles={roles}
        onAdd={scenario.run}
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
  const [value, setValue] = useState("member");
  return (
    <Preview>
      <div className="max-w-sm">
        <ChoiceField
          label="Role"
          value={value}
          onChange={setValue}
          options={roles}
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
