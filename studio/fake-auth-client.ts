// A stand-in for @avgeek-oss/auth-client's AuthClient, for the connected
// container stories and tests. It keeps its data in memory and answers with
// the real AuthClientError, so containers see the same failures as against
// auth-core.
import {
  AuthClientError,
  type ApiKey,
  type AuthClient,
  type AuthSession,
  type ConnectedApp,
  type ConsentRequest,
  type Role,
} from "@avgeek-oss/auth-client";

export type FakeAuthClientOptions = {
  role?: Role;
  signedIn?: boolean;
  latencyMs?: number;
  apiKeys?: ApiKey[];
  connectedApps?: ConnectedApp[];
  consent?: ConsentRequest | null;
  /** Makes every list request fail. */
  failLists?: boolean;
  /** Makes every change fail with this code. */
  failChanges?: string;
  /** Admin keys and grants need a recent sign-in, as in auth-core. */
  stepUpForAdmin?: boolean;
  endSessionUrl?: string | null;
};

export type FakeAuthClient = AuthClient<object> & {
  /** Every call, as `method arguments`. */
  readonly calls: string[];
  /** Marks the session as recently confirmed, as a step-up does. */
  readonly confirmRecentSignIn: () => void;
};

const ROLES: readonly Role[] = ["viewer", "member", "admin"];

export const fakeSession = (role: Role): AuthSession<object> => ({
  user: {
    id: "0b6c3f1e-5d55-4c39-9a51-8d1f7e0c2a11",
    role,
    email: "ada@example.test",
    displayName: "Ada Lovelace",
  },
  role,
  ext: {},
  session: {
    authenticatedAt: "2026-10-29T08:00:00Z",
    expiresAt: "2026-10-29T20:00:00Z",
    amr: ["mfa"],
  },
});

export const fakeConsentRequest: ConsentRequest = {
  client: {
    id: "https://client.example.test/oauth/client.json",
    name: "Example MCP client",
    logoUri: null,
    kind: "metadata",
    redirectUri: "https://client.example.test/callback",
    redirectHost: "client.example.test",
    localhost: false,
  },
  resource: { uri: "https://api.example.test/mcp", name: "Example MCP" },
  scope: null,
  ceilings: ["viewer", "member", "admin"],
  defaultCeiling: "viewer",
  expiresAt: "2026-10-29T09:10:00Z",
};

export const fakeApiKey = (overrides: Partial<ApiKey> = {}): ApiKey => ({
  id: "01JBKEY0000000000000000001",
  name: "Release automation",
  ceiling: "member",
  workspace: null,
  createdAt: "2026-09-01T10:00:00Z",
  expiresAt: "2099-01-01T00:00:00Z",
  lastUsedAt: "2026-10-28T10:00:00Z",
  replacedBy: null,
  graceUntil: null,
  ...overrides,
});

export const fakeConnectedApp = (
  overrides: Partial<ConnectedApp> = {},
): ConnectedApp => ({
  id: "6f1c0a6e-1b0e-4a8e-9d58-3f6b2c9d1a01",
  clientId: "https://chatgpt.com/oauth/codex/client.json",
  clientName: "Codex",
  logoUri: null,
  ceiling: "member",
  resources: ["https://api.example.test/mcp"],
  restrictions: null,
  createdAt: "2026-10-01T12:00:00Z",
  lastUsedAt: "2026-10-28T09:30:00Z",
  ...overrides,
});

export function createFakeAuthClient(
  options: FakeAuthClientOptions = {},
): FakeAuthClient {
  const role = options.role ?? "admin";
  const latency = options.latencyMs ?? 0;
  let keys = [...(options.apiKeys ?? [])];
  let apps = [...(options.connectedApps ?? [])];
  let recent = false;
  let sequence = 0;
  const calls: string[] = [];
  const wait = () =>
    latency ? new Promise((resolve) => setTimeout(resolve, latency)) : null;
  async function call<T>(name: string, run: () => T): Promise<T> {
    calls.push(name);
    await wait();
    return run();
  }
  const fail = (code: string, status: number, message: string) =>
    new AuthClientError({
      code,
      status,
      message,
      ...(code === "step_up_required"
        ? { details: { stepUpUrl: "fake://step-up" } }
        : {}),
    });
  const change = (ceiling: Role | null) => {
    if (options.failChanges)
      throw fail(options.failChanges, 503, "The change failed. Try again.");
    if (ceiling === "admin" && options.stepUpForAdmin && !recent)
      throw fail(
        "step_up_required",
        401,
        "This action needs a recent sign-in.",
      );
    if (ceiling && ROLES.indexOf(ceiling) > ROLES.indexOf(role))
      throw fail("forbidden", 403, "That role is higher than yours.");
  };
  const issue = (input: {
    name: string;
    ceiling: Role;
    workspace: string | null;
  }) => {
    sequence += 1;
    const apiKey = fakeApiKey({
      id: `01JBKEYNEW00000000000000${String(sequence).padStart(2, "0")}`,
      name: input.name,
      ceiling: input.ceiling,
      workspace: input.workspace,
      createdAt: "2026-10-29T09:00:00Z",
      lastUsedAt: null,
    });
    keys = [apiKey, ...keys];
    return { key: `fake_${apiKey.id}_secret`, apiKey };
  };
  const list = <T>(name: string, items: () => T[]) =>
    call(name, () => {
      if (options.failLists)
        throw fail("unavailable", 503, "The service is busy. Try again.");
      return items();
    });
  return {
    calls,
    confirmRecentSignIn: () => {
      recent = true;
    },
    options: {
      apiOrigin: "",
      basePath: "/auth",
      oauthBasePath: "/oauth",
      csrfHeader: "x-requested-with",
    },
    getSession: () =>
      call("getSession", () =>
        options.signedIn === false ? null : fakeSession(role),
      ),
    signInUrl: (returnTo) =>
      `fake://sign-in?returnTo=${encodeURIComponent(returnTo ?? "")}`,
    stepUpUrl: (returnTo) =>
      `fake://step-up?returnTo=${encodeURIComponent(returnTo ?? "")}`,
    signOut: () =>
      call("signOut", () =>
        options.endSessionUrl === undefined
          ? "fake://provider/logout"
          : options.endSessionUrl,
      ),
    apiKeys: {
      list: () => list("apiKeys.list", () => [...keys]),
      create: (input) =>
        call(`apiKeys.create ${input.name} ${input.ceiling}`, () => {
          change(input.ceiling);
          return issue({
            name: input.name,
            ceiling: input.ceiling,
            workspace: input.workspace ?? null,
          });
        }),
      rotate: (id, rotate = {}) =>
        call(`apiKeys.rotate ${id} ${rotate.graceSeconds ?? 0}`, () => {
          const old = keys.find((key) => key.id === id);
          if (!old) throw fail("not_found", 404, "No such API key.");
          change(old.ceiling);
          const issued = issue(old);
          keys = keys.map((key) =>
            key.id === id
              ? {
                  ...key,
                  replacedBy: issued.apiKey.id,
                  graceUntil: "2099-01-01T00:00:00Z",
                }
              : key,
          );
          return issued;
        }),
      revoke: (id) =>
        call(`apiKeys.revoke ${id}`, () => {
          change(null);
          keys = keys.filter((key) => key.id !== id);
        }),
    },
    connectedApps: {
      list: () => list("connectedApps.list", () => [...apps]),
      revoke: (id) =>
        call(`connectedApps.revoke ${id}`, () => {
          change(null);
          apps = apps.filter((app) => app.id !== id);
        }),
    },
    consent: {
      get: (id) =>
        call(`consent.get ${id}`, () => {
          if (!options.consent)
            throw fail("not_found", 404, "No such request.");
          return options.consent;
        }),
      decide: (id, input) =>
        call(
          `consent.decide ${id} ${input.approve ? "approve" : "deny"} ${input.ceiling ?? ""}`,
          () => {
            if (input.approve) change(input.ceiling ?? null);
            const target = new URL(
              options.consent?.client.redirectUri ?? "https://client.invalid",
            );
            target.searchParams.set(
              input.approve ? "code" : "error",
              input.approve ? "fake-code" : "access_denied",
            );
            return { redirectUri: target.href };
          },
        ),
    },
    admin: {
      apiKeys: {
        list: () => list("admin.apiKeys.list", () => [...keys]),
        revoke: (id) => call(`admin.apiKeys.revoke ${id}`, () => {}),
      },
      connectedApps: {
        list: () => list("admin.connectedApps.list", () => [...apps]),
        revoke: (id) => call(`admin.connectedApps.revoke ${id}`, () => {}),
      },
    },
  };
}
