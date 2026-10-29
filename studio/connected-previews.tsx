import { useState, type ReactNode } from "react";
import { toast } from "../src/overlays/toast";
import {
  ConnectedAccountSettings,
  ConnectedApiKeysSettings,
  ConnectedMcpConnections,
  ConnectedMcpConsent,
  ConnectedSignIn,
} from "../src/patterns/auth/connected";
import { authPreviewBrand, previewProvider } from "./auth-previews";
import {
  createFakeAuthClient,
  fakeApiKey,
  fakeConnectedApp,
  fakeConsentRequest,
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

export function ConnectedAccountPreview() {
  return (
    <ConnectedFixture options={{ role: "member" }}>
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
