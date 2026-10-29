import "./dom-environment.js";
import assert from "node:assert/strict";
import test, { afterEach, beforeEach, mock } from "node:test";
import { act, StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { toast } from "../src/overlays/toast.js";
import {
  ConnectedAccountSettings,
  ConnectedApiKeysSettings,
  ConnectedMcpConnections,
  ConnectedMcpConsent,
  ConnectedPeopleDirectory,
  ConnectedSignIn,
} from "../src/patterns/auth/connected.js";
import {
  createFakeAuthClient,
  fakeActiveSession,
  fakeApiKey,
  fakeConnectedApp,
  fakeConsentRequest,
  fakeDirectoryUser,
  type FakeAuthClientOptions,
} from "../studio/fake-auth-client.js";

let dangerMessages: ReactNode[] = [];
let visited: string[] = [];
const navigate = (url: string) => {
  visited.push(url);
};
beforeEach(() => {
  dangerMessages = [];
  visited = [];
  window.sessionStorage.clear();
  window.history.replaceState(null, "", "/settings");
  mock.method(toast, "danger", (message: ReactNode) => {
    dangerMessages.push(message);
    return "test-toast";
  });
  mock.method(toast, "success", () => "test-toast");
});
afterEach(() => mock.restoreAll());

async function wait(ms: number) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
  await settle();
}
async function settle() {
  for (let round = 0; round < 6; round++)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
}
async function mount(content: ReactNode) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => root.render(<StrictMode>{content}</StrictMode>));
  await settle();
  return {
    async unmount() {
      await act(async () => root.unmount());
      container.remove();
    },
  };
}
const text = () => document.body.textContent ?? "";
function button(label: string) {
  const found = [...document.querySelectorAll("button")].filter(
    (item) => item.textContent?.trim() === label,
  );
  assert.ok(found.length, `Missing button: ${label}`);
  return found[found.length - 1] as HTMLButtonElement;
}
async function click(element: Element) {
  await act(async () => {
    element.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
  });
  await settle();
}
async function choose(label: string) {
  const named = (option: HTMLOptionElement) =>
    option.textContent === label ||
    (option.textContent ?? "").startsWith(`${label} `);
  const select = [...document.querySelectorAll("select")].find((element) =>
    [...element.options].some(named),
  );
  assert.ok(select, `Missing option: ${label}`);
  const option = [...select.options].find(named);
  assert.ok(option);
  await act(async () => {
    select.value = option.value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
async function fill(name: string, value: string) {
  const input = document.querySelector<HTMLInputElement>(
    `input[name="${name}"]`,
  );
  assert.ok(input, `Missing input: ${name}`);
  await act(async () => {
    // oxlint-disable-next-line typescript/unbound-method -- the native value setter is called with .call(element, value)
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    assert.ok(setter);
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function submit() {
  const forms = [...document.querySelectorAll("form")];
  const form = forms[forms.length - 1];
  assert.ok(form);
  await act(async () => {
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
  });
  await settle();
}
const client = (options: FakeAuthClientOptions = {}) =>
  createFakeAuthClient(options);
const brand = "Avgeek";
const names = { productName: "Posted", providerName: "authentik" };
const formatDate = (value: string) => value.slice(0, 10);

test("sign-in shows a redirect error once, keeps returnTo and starts sign-in back to it", async () => {
  window.history.replaceState(
    null,
    "",
    "/sign-in?returnTo=%2Fboards%3Ftab%3D2&auth_error=step_up_failed&auth_error_reason=mfa_missing",
  );
  const auth = client();
  const view = await mount(
    <ConnectedSignIn
      client={auth}
      navigate={navigate}
      brand={brand}
      {...names}
    />,
  );
  try {
    assert.match(text(), /multi-factor authentication in authentik/);
    assert.equal(
      `${window.location.pathname}${window.location.search}`,
      "/sign-in?returnTo=%2Fboards%3Ftab%3D2",
    );
    await click(button("Continue with authentik"));
    assert.deepEqual(visited, [auth.signInUrl("/boards?tab=2")]);
  } finally {
    await view.unmount();
  }
});

test("sign-in turns an access denial into the access-denied screen and ignores foreign returnTo values", async () => {
  window.history.replaceState(
    null,
    "",
    "/sign-in?returnTo=%2F%2Fevil.example&auth_error=sign_in_denied&auth_error_reason=no_role",
  );
  const auth = client();
  const view = await mount(
    <ConnectedSignIn
      client={auth}
      navigate={navigate}
      brand={brand}
      {...names}
    />,
  );
  try {
    assert.match(
      text(),
      /You don't have access to Posted\. Ask an admin to assign it to you in authentik\./,
    );
    await click(button("Try again"));
    assert.deepEqual(visited, [auth.signInUrl("/")]);
  } finally {
    await view.unmount();
  }
});

test("consent sends a signed-out visitor to sign-in and back to the request", async () => {
  window.history.replaceState(null, "", "/oauth/consent?request=r1");
  const auth = client({ signedIn: false, consent: fakeConsentRequest });
  const view = await mount(
    <ConnectedMcpConsent
      client={auth}
      navigate={navigate}
      brand={brand}
      {...names}
    />,
  );
  try {
    // StrictMode runs the load twice; both send the same visitor to sign-in.
    assert.ok(visited.length > 0);
    for (const url of visited)
      assert.equal(url, auth.signInUrl("/oauth/consent?request=r1"));
    assert.ok(!auth.calls.some((call) => call.startsWith("consent.get")));
  } finally {
    await view.unmount();
  }
});

test("consent approves with the chosen ceiling and then follows the client's redirect", async () => {
  window.history.replaceState(null, "", "/oauth/consent?request=r1");
  const auth = client({
    role: "member",
    consent: { ...fakeConsentRequest, ceilings: ["viewer", "member"] },
  });
  const view = await mount(
    <ConnectedMcpConsent
      client={auth}
      navigate={navigate}
      brand={brand}
      {...names}
    />,
  );
  try {
    assert.ok(auth.calls.includes("consent.get r1"));
    assert.match(text(), /Example MCP client/);
    await choose("Member");
    await click(button("Approve"));
    assert.ok(auth.calls.includes("consent.decide r1 approve member"));
    assert.equal(visited.length, 1);
    assert.match(
      visited[0] ?? "",
      /^https:\/\/client\.example\.test\/callback\?code=/,
    );
    assert.equal(button("Approve").disabled, true);
  } finally {
    await view.unmount();
  }
});

test("an admin ceiling steps up, then approves on return without asking again", async () => {
  window.history.replaceState(null, "", "/oauth/consent?request=r1");
  const auth = client({ consent: fakeConsentRequest, stepUpForAdmin: true });
  const render = () => (
    <ConnectedMcpConsent
      client={auth}
      navigate={navigate}
      brand={brand}
      {...names}
    />
  );
  const view = await mount(render());
  try {
    await choose("Admin");
    await click(button("Approve"));
    assert.match(text(), /Confirm it's you/);
    assert.match(text(), /act as an admin needs a recent sign-in/);
    assert.deepEqual(visited, []);
    await click(button("Continue with authentik"));
    assert.deepEqual(visited, [auth.stepUpUrl("/oauth/consent?request=r1")]);
  } finally {
    await view.unmount();
  }
  auth.confirmRecentSignIn();
  visited = [];
  const again = await mount(render());
  try {
    assert.equal(
      auth.calls.filter((call) => call === "consent.decide r1 approve admin")
        .length,
      2,
    );
    assert.match(visited[0] ?? "", /code=/);
    assert.doesNotMatch(text(), /Confirm it's you/);
  } finally {
    await again.unmount();
  }
});

test("consent explains an expired request and blocks a decision whose answer was lost", async () => {
  window.history.replaceState(null, "", "/oauth/consent?request=r1");
  const missing = await mount(
    <ConnectedMcpConsent
      client={client({ consent: null })}
      navigate={navigate}
      brand={brand}
      {...names}
    />,
  );
  try {
    assert.match(text(), /This request has expired/);
  } finally {
    await missing.unmount();
  }
  const auth = client({
    consent: fakeConsentRequest,
    failChanges: "network_error",
  });
  const view = await mount(
    <ConnectedMcpConsent
      client={auth}
      navigate={navigate}
      brand={brand}
      {...names}
    />,
  );
  try {
    await click(button("Approve"));
    assert.match(text(), /could not be confirmed/);
    assert.equal(button("Approve").disabled, true);
    assert.equal(button("Deny").disabled, true);
    assert.deepEqual(dangerMessages, []);
  } finally {
    await view.unmount();
  }
});

test("API keys list, create with a ceiling up to the person's role and reveal the secret once", async () => {
  const auth = client({ role: "member", apiKeys: [fakeApiKey()] });
  const view = await mount(
    <ConnectedApiKeysSettings
      client={auth}
      navigate={navigate}
      providerName="authentik"
      formatDate={formatDate}
    />,
  );
  try {
    assert.match(text(), /Release automation/);
    await click(button("Create API key"));
    const roles = [...document.querySelectorAll("select")]
      .flatMap((select) => [...select.options])
      .map((option) => option.textContent ?? "");
    assert.ok(roles.some((label) => label.startsWith("Member")));
    assert.ok(!roles.some((label) => label.startsWith("Admin")));
    await fill("name", "Deploys");
    await choose("Member");
    await choose("30 days");
    await submit();
    assert.ok(auth.calls.includes("apiKeys.create Deploys member"));
    assert.match(text(), /Copy your API key/);
    assert.match(text(), /fake_01JBKEYNEW/);
    await click(button("Done"));
    assert.doesNotMatch(text(), /fake_01JBKEYNEW/);
    assert.match(text(), /Deploys/);
  } finally {
    await view.unmount();
  }
});

test("an admin key steps up first and is created, with its secret, when the person returns", async () => {
  const auth = client({ stepUpForAdmin: true });
  const render = () => (
    <ConnectedApiKeysSettings
      client={auth}
      navigate={navigate}
      providerName="authentik"
      formatDate={formatDate}
    />
  );
  const view = await mount(render());
  try {
    await click(button("Create API key"));
    await fill("name", "Admin automation");
    await choose("Admin");
    await choose("Never");
    await submit();
    assert.match(text(), /Creating an admin API key needs a recent sign-in/);
    assert.deepEqual(dangerMessages, []);
    await click(button("Continue with authentik"));
    assert.deepEqual(visited, [auth.stepUpUrl("/settings")]);
  } finally {
    await view.unmount();
  }
  auth.confirmRecentSignIn();
  const again = await mount(render());
  try {
    assert.equal(
      auth.calls.filter(
        (call) => call === "apiKeys.create Admin automation admin",
      ).length,
      2,
    );
    assert.match(text(), /Copy your API key/);
    assert.match(text(), /Admin automation/);
  } finally {
    await again.unmount();
  }
});

test("a step-up for another page or an old step-up does not replay", async () => {
  window.sessionStorage.setItem(
    "avgeek-oss-design-system:step-up",
    JSON.stringify({
      action: "api-keys:create",
      input: {
        name: "Old",
        ceiling: "viewer",
        workspace: null,
        expiresInSeconds: null,
      },
      path: "/elsewhere",
      at: Date.now(),
    }),
  );
  const auth = client();
  const view = await mount(
    <ConnectedApiKeysSettings
      client={auth}
      navigate={navigate}
      providerName="authentik"
      formatDate={formatDate}
    />,
  );
  try {
    assert.ok(!auth.calls.some((call) => call.startsWith("apiKeys.create")));
    assert.equal(
      window.sessionStorage.getItem("avgeek-oss-design-system:step-up"),
      null,
    );
  } finally {
    await view.unmount();
  }
});

test("revoking a key removes it at once and restores it with one toast when the request fails", async () => {
  const auth = client({ apiKeys: [fakeApiKey()], failChanges: "unavailable" });
  const view = await mount(
    <ConnectedApiKeysSettings
      client={auth}
      navigate={navigate}
      providerName="authentik"
      formatDate={formatDate}
    />,
  );
  try {
    await click(button("Revoke"));
    await click(button("Revoke key"));
    assert.ok(auth.calls.includes(`apiKeys.revoke ${fakeApiKey().id}`));
    assert.deepEqual(dangerMessages, ["The change failed. Try again."]);
    assert.match(text(), /Release automation/);
  } finally {
    await view.unmount();
  }
});

test("rotation sends the chosen grace period and marks the old key as rotating", async () => {
  const auth = client({ apiKeys: [fakeApiKey()] });
  const view = await mount(
    <ConnectedApiKeysSettings
      client={auth}
      navigate={navigate}
      providerName="authentik"
      formatDate={formatDate}
    />,
  );
  try {
    await click(button("Rotate"));
    await choose("1 hour");
    await submit();
    assert.ok(auth.calls.includes(`apiKeys.rotate ${fakeApiKey().id} 3600`));
    assert.match(text(), /Copy your API key/);
    await click(button("Done"));
    assert.match(text(), /Rotating/);
  } finally {
    await view.unmount();
  }
});

test("a failed list shows the error with a retry rather than an empty list", async () => {
  const view = await mount(
    <ConnectedMcpConnections
      client={client({ failLists: true })}
      formatDate={formatDate}
    />,
  );
  try {
    assert.match(text(), /The service is busy/);
    assert.doesNotMatch(text(), /No connected apps/);
    assert.ok(button("Retry"));
  } finally {
    await view.unmount();
  }
});

test("disconnecting an app removes it, and a failure brings it back with one toast", async () => {
  const apps = [fakeConnectedApp()];
  const ok = client({ connectedApps: apps });
  const view = await mount(
    <ConnectedMcpConnections client={ok} formatDate={formatDate} />,
  );
  try {
    assert.match(text(), /Codex/);
    await click(button("Disconnect"));
    await click(button("Disconnect"));
    assert.ok(ok.calls.includes(`connectedApps.revoke ${apps[0]?.id}`));
    assert.match(text(), /No connected apps yet/);
  } finally {
    await view.unmount();
  }
  const failing = await mount(
    <ConnectedMcpConnections
      client={client({ connectedApps: apps, failChanges: "unavailable" })}
      formatDate={formatDate}
    />,
  );
  try {
    await click(button("Disconnect"));
    await click(button("Disconnect"));
    assert.deepEqual(dangerMessages, ["The change failed. Try again."]);
    assert.match(text(), /Codex/);
  } finally {
    await failing.unmount();
  }
});

const thisBrowser = fakeActiveSession({
  id: "4c3b2a19-0000-4000-8000-000000000001",
  current: true,
});
const phone = fakeActiveSession({
  id: "4c3b2a19-0000-4000-8000-000000000002",
  browser: "Safari",
  os: "iOS",
});
const accountSettings = (
  options: FakeAuthClientOptions,
  signedOutUrl?: string,
) => {
  const auth = client({
    role: "member",
    sessions: [thisBrowser, phone],
    ...options,
  });
  return {
    auth,
    view: () =>
      mount(
        <ConnectedAccountSettings
          client={auth}
          navigate={navigate}
          providerName="authentik"
          formatDate={formatDate}
          signedOutUrl={signedOutUrl}
        />,
      ),
  };
};

test("account settings load the profile and every session, with the browser, operating system and this device", async () => {
  const { view } = accountSettings({ latencyMs: 50 });
  const settings = await view();
  try {
    assert.match(text(), /Loading your account/);
    await wait(120);
    assert.match(text(), /Ada Lovelace/);
    assert.match(text(), /ada@example\.test/);
    assert.match(text(), /Firefox on macOS/);
    assert.match(text(), /Safari on iOS/);
    assert.match(text(), /This device/);
    assert.ok(button("Sign out everywhere"));
  } finally {
    await settings.unmount();
  }
});

test("a failed session list keeps the profile and offers a retry", async () => {
  const { view } = accountSettings({ failLists: true });
  const settings = await view();
  try {
    assert.match(text(), /Ada Lovelace/);
    assert.match(text(), /The service is busy/);
    assert.ok(button("Retry"));
    assert.doesNotMatch(text(), /Sign out everywhere/);
  } finally {
    await settings.unmount();
  }
});

test("signing out another session removes it and stays on the page; a failure brings it back with one toast", async () => {
  const { auth, view } = accountSettings({});
  const settings = await view();
  try {
    const row = [...document.querySelectorAll("tr")].find((item) =>
      item.textContent?.includes("Safari on iOS"),
    );
    const signOut = row?.querySelector("button");
    assert.ok(signOut);
    await click(signOut);
    await click(button("Sign out"));
    assert.ok(auth.calls.includes(`sessions.revoke ${phone.id}`));
    assert.doesNotMatch(text(), /Safari on iOS/);
    assert.deepEqual(visited, []);
  } finally {
    await settings.unmount();
  }
  const failing = accountSettings({ failChanges: "unavailable" });
  const again = await failing.view();
  try {
    const row = [...document.querySelectorAll("tr")].find((item) =>
      item.textContent?.includes("Safari on iOS"),
    );
    const signOut = row?.querySelector("button");
    assert.ok(signOut);
    await click(signOut);
    await click(button("Sign out"));
    assert.deepEqual(dangerMessages, ["The change failed. Try again."]);
    assert.match(text(), /Safari on iOS/);
    assert.deepEqual(visited, []);
  } finally {
    await again.unmount();
  }
});

test("signing out this browser revokes its session and goes to the provider's logout, or to signedOutUrl without one", async () => {
  const withLogout = accountSettings({});
  const settings = await withLogout.view();
  try {
    const row = [...document.querySelectorAll("tr")].find((item) =>
      item.textContent?.includes("This device"),
    );
    const signOut = row?.querySelector("button");
    assert.ok(signOut);
    await click(signOut);
    assert.ok(
      withLogout.auth.calls.includes(`sessions.revoke ${thisBrowser.id}`),
    );
    assert.deepEqual(visited, ["fake://provider/logout"]);
  } finally {
    await settings.unmount();
  }
  visited = [];
  const withoutLogout = accountSettings({ endSessionUrl: null }, "/signed-out");
  const again = await withoutLogout.view();
  try {
    const row = [...document.querySelectorAll("tr")].find((item) =>
      item.textContent?.includes("This device"),
    );
    const signOut = row?.querySelector("button");
    assert.ok(signOut);
    await click(signOut);
    assert.deepEqual(visited, ["/signed-out"]);
  } finally {
    await again.unmount();
  }
});

test("signing out everywhere ends every session and leaves through the provider's logout", async () => {
  const { auth, view } = accountSettings({});
  const settings = await view();
  try {
    await click(button("Sign out everywhere"));
    await click(button("Sign out everywhere"));
    assert.ok(auth.calls.includes("sessions.signOutEverywhere"));
    assert.deepEqual(visited, ["fake://provider/logout"]);
  } finally {
    await settings.unmount();
  }
});

const directory = Array.from({ length: 7 }, (_, index) =>
  fakeDirectoryUser({
    id: `0b6c3f1e-5d55-4c39-9a51-8d1f7e0c2a${String(11 + index)}`,
    displayName: index === 0 ? "Ada Lovelace" : `Person ${index}`,
    email: index === 0 ? "ada@example.test" : `person${index}@example.test`,
    role: index === 3 ? null : "member",
    status: index === 3 ? "suspended" : index === 4 ? "deactivated" : "active",
    roleSource: index === 5 ? "claims" : "scim",
  }),
);
const peopleDirectory = (options: FakeAuthClientOptions = {}) => {
  const auth = client({ users: directory, ...options });
  return {
    auth,
    view: () =>
      mount(
        <ConnectedPeopleDirectory
          client={auth}
          navigate={navigate}
          providerName="authentik"
          formatDate={formatDate}
          pageSize={5}
        />,
      ),
  };
};
const listCalls = (calls: string[]) =>
  calls.filter((call) => call.startsWith("admin.users.list"));

test("the people directory shows a page with status, source and the managed-in note, and pages by cursor", async () => {
  const { auth, view } = peopleDirectory({ latencyMs: 50 });
  const people = await view();
  try {
    assert.match(text(), /Loading people/);
    await wait(120);
    assert.match(text(), /Ada Lovelace \(you\)/);
    assert.match(text(), /Access is managed in authentik/);
    assert.match(text(), /Suspended/);
    assert.match(text(), /Deactivated/);
    assert.match(text(), /SCIM/);
    assert.doesNotMatch(text(), /Person 6/);
    await click(button("Next"));
    await wait(120);
    assert.ok(
      listCalls(auth.calls).includes("admin.users.list q= status= cursor=5"),
    );
    assert.match(text(), /Person 6/);
    assert.match(text(), /Sign-in/);
    assert.doesNotMatch(text(), /Ada Lovelace/);
    await click(button("Previous"));
    await wait(120);
    assert.equal(
      listCalls(auth.calls).at(-1),
      "admin.users.list q= status= cursor=",
    );
    assert.match(text(), /Ada Lovelace/);
  } finally {
    await people.unmount();
  }
});

test("the directory search waits for typing to pause, and the status filter starts again from the first page", async () => {
  const { auth, view } = peopleDirectory();
  const people = await view();
  try {
    const input = document.querySelector<HTMLInputElement>(
      'input[type="search"]',
    );
    assert.ok(input);
    for (const value of ["p", "pe", "person 2"]) {
      await act(async () => {
        // oxlint-disable-next-line typescript/unbound-method -- the native value setter is called with .call(element, value)
        const setter = Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        )?.set;
        assert.ok(setter);
        setter.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
    }
    await settle();
    assert.ok(!auth.calls.some((call) => call.includes("q=p")));
    await wait(350);
    assert.ok(
      listCalls(auth.calls).includes(
        "admin.users.list q=person 2 status= cursor=",
      ),
    );
    assert.ok(!auth.calls.some((call) => / q=pe? /.test(call)));
    assert.match(text(), /Person 2/);
    assert.doesNotMatch(text(), /Ada Lovelace/);
    await choose("Suspended");
    await settle();
    assert.ok(
      listCalls(auth.calls).includes(
        "admin.users.list q=person 2 status=suspended cursor=",
      ),
    );
    assert.match(text(), /No people yet/);
    assert.match(text(), /Try a different search or change the status/);
  } finally {
    await people.unmount();
  }
});

test("the directory tells a non-admin it is for admins, and a failed load offers a retry", async () => {
  const member = peopleDirectory({ role: "member" });
  const people = await member.view();
  try {
    assert.match(text(), /Only admins can see the people directory/);
    assert.equal(document.querySelectorAll("button").length, 0);
  } finally {
    await people.unmount();
  }
  const failing = peopleDirectory({ failLists: true });
  const again = await failing.view();
  try {
    assert.match(text(), /The service is busy/);
    assert.doesNotMatch(text(), /No people yet/);
    const before = listCalls(failing.auth.calls).length;
    await click(button("Retry"));
    assert.ok(listCalls(failing.auth.calls).length > before);
  } finally {
    await again.unmount();
  }
});
