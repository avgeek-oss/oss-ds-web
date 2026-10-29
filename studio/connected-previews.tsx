import { useState, type ReactNode } from "react";
import { toast } from "../src/overlays/toast";
import {
  ConnectedAccountSettings,
  ConnectedApiKeysSettings,
  ConnectedMcpConnections,
  ConnectedMcpConsent,
  ConnectedPeopleDirectory,
  ConnectedSignIn,
} from "../src/patterns/auth/connected";
import { authPreviewBrand, previewProvider } from "./auth-previews";
import {
  createFakeAuthClient,
  fakeActiveSession,
  fakeApiKey,
  fakeConnectedApp,
  fakeConsentRequest,
  fakeDirectoryUser,
  type FakeAuthClient,
  type FakeAuthClientOptions,
} from "./fake-auth-client";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));

/**
 * Runs a container against the fake client. Navigating to step-up confirms
 * the fake session and mounts the container again, as coming back from the
 * provider to the same page does.
 */
function ConnectedFixture({
  options,
  children,
}: {
  options: FakeAuthClientOptions;
  children: (
    client: FakeAuthClient,
    navigate: (url: string) => void,
  ) => ReactNode;
}) {
  // One client for the fixture's lifetime, so its data survives a visit.
  const [client] = useState(() =>
    createFakeAuthClient({ latencyMs: 400, ...options }),
  );
  const [visit, setVisit] = useState(0);
  const [location, setLocation] = useState("");
  const navigate = (url: string) => {
    setLocation(url);
    if (url.startsWith("fake://step-up")) {
      client.confirmRecentSignIn();
      toast.info("Preview: confirmed at authentik, coming back");
      setTimeout(() => setVisit((count) => count + 1), 600);
    } else toast.info(`Preview: navigate to ${url}`);
  };
  return (
    <div className="grid gap-4">
      <p className="sr-only" data-testid="last-navigation">
        {location}
      </p>
      <div key={visit}>{children(client, navigate)}</div>
    </div>
  );
}

export function ConnectedSignInPreview() {
  return (
    <ConnectedFixture options={{}}>
      {(client, navigate) => (
        <ConnectedSignIn
          client={client}
          navigate={navigate}
          brand={authPreviewBrand}
          productName="Avgeek"
          providerName={previewProvider}
        />
      )}
    </ConnectedFixture>
  );
}

export function ConnectedConsentPreview({
  stepUp = false,
  missing = false,
}: {
  stepUp?: boolean;
  missing?: boolean;
}) {
  return (
    <ConnectedFixture
      options={{
        consent: missing ? null : fakeConsentRequest,
        stepUpForAdmin: stepUp,
      }}
    >
      {(client, navigate) => (
        <ConnectedMcpConsent
          client={client}
          navigate={navigate}
          requestId="request-1"
          brand={authPreviewBrand}
          productName="Avgeek"
          providerName={previewProvider}
        />
      )}
    </ConnectedFixture>
  );
}

export const previewSessions = [
  fakeActiveSession({
    id: "4c3b2a19-0000-4000-8000-000000000001",
    current: true,
  }),
  fakeActiveSession({
    id: "4c3b2a19-0000-4000-8000-000000000002",
    createdAt: "2026-10-27T18:20:00Z",
    lastSeenAt: "2026-10-28T21:05:00Z",
    idleExpiresAt: "2026-10-29T05:05:00Z",
    expiresAt: "2026-10-30T06:20:00Z",
    browser: "Safari",
    os: "iOS",
  }),
  fakeActiveSession({
    id: "4c3b2a19-0000-4000-8000-000000000003",
    createdAt: "2026-10-20T09:00:00Z",
    lastSeenAt: "2026-10-26T12:30:00Z",
    browser: null,
    os: null,
  }),
];

export function ConnectedAccountPreview({
  failLists = false,
}: {
  failLists?: boolean;
}) {
  return (
    <ConnectedFixture
      options={{ role: "member", sessions: previewSessions, failLists }}
    >
      {(client, navigate) => (
        <div className="max-w-3xl p-4">
          <ConnectedAccountSettings
            client={client}
            navigate={navigate}
            providerName={previewProvider}
            manageUrl="https://auth.example.test/if/user/"
            formatDate={formatDate}
          />
        </div>
      )}
    </ConnectedFixture>
  );
}

const directoryNames = [
  ["Ada Lovelace", "ada"],
  ["Sam Chen", "sam"],
  ["Lee Okafor", "lee"],
  ["Kim Park", "kim"],
  ["Noor Haddad", "noor"],
  ["Grace Hopper", "grace"],
  ["Alan Turing", "alan"],
  ["Katherine Johnson", "katherine"],
] as const;

export const previewDirectory = directoryNames.map(([name, handle], index) =>
  fakeDirectoryUser({
    id: `0b6c3f1e-5d55-4c39-9a51-8d1f7e0c2a${String(11 + index)}`,
    displayName: name,
    email: `${handle}@example.test`,
    role: index === 0 ? "admin" : index === 2 ? null : "member",
    roleSource: index === 4 ? "claims" : "scim",
    status: index === 2 ? "suspended" : index === 3 ? "deactivated" : "active",
    lastSignInAt:
      index === 4 ? null : `2026-10-${String(28 - index)}T09:00:00Z`,
  }),
);

export function ConnectedPeoplePreview({
  role = "admin",
  failLists = false,
}: {
  role?: "admin" | "member";
  failLists?: boolean;
}) {
  return (
    <ConnectedFixture options={{ role, users: previewDirectory, failLists }}>
      {(client, navigate) => (
        <div className="p-4">
          <ConnectedPeopleDirectory
            client={client}
            navigate={navigate}
            providerName={previewProvider}
            manageUrl="https://auth.example.test/if/admin/"
            formatDate={formatDate}
            pageSize={5}
          />
        </div>
      )}
    </ConnectedFixture>
  );
}

export function ConnectedApiKeysPreview({
  failLists = false,
  workspaces = false,
}: {
  failLists?: boolean;
  workspaces?: boolean;
}) {
  return (
    <ConnectedFixture
      options={{
        stepUpForAdmin: true,
        failLists,
        apiKeys: [
          fakeApiKey(),
          fakeApiKey({
            id: "01JBKEY0000000000000000002",
            name: "Reporting",
            ceiling: "viewer",
            workspace: workspaces ? "ops" : null,
            expiresAt: null,
            lastUsedAt: null,
          }),
        ],
      }}
    >
      {(client, navigate) => (
        <div className="p-4">
          <ConnectedApiKeysSettings
            client={client}
            navigate={navigate}
            providerName={previewProvider}
            formatDate={formatDate}
            workspaces={
              workspaces
                ? [
                    { id: "ops", label: "Operations" },
                    { id: "fleet", label: "Fleet" },
                  ]
                : undefined
            }
          />
        </div>
      )}
    </ConnectedFixture>
  );
}

export function ConnectedMcpConnectionsPreview({
  failChanges = false,
}: {
  failChanges?: boolean;
}) {
  return (
    <ConnectedFixture
      options={{
        failChanges: failChanges ? "unavailable" : undefined,
        connectedApps: [
          fakeConnectedApp(),
          fakeConnectedApp({
            id: "6f1c0a6e-1b0e-4a8e-9d58-3f6b2c9d1a02",
            clientId: "https://client.example.test/oauth/client.json",
            clientName: "Example desktop client",
            ceiling: "viewer",
            lastUsedAt: null,
          }),
        ],
      }}
    >
      {(client) => (
        <div className="p-4">
          <ConnectedMcpConnections client={client} formatDate={formatDate} />
        </div>
      )}
    </ConnectedFixture>
  );
}
