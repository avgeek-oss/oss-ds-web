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
  ConnectedSignIn,
} from "../src/patterns/auth/connected.js";
import {
  createFakeAuthClient,
  fakeApiKey,
  fakeConnectedApp,
  fakeConsentRequest,
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

test("account settings show the provider profile and sign out to the provider's logout", async () => {
  const auth = client({ role: "member" });
  const view = await mount(
    <ConnectedAccountSettings
      client={auth}
      navigate={navigate}
      providerName="authentik"
      formatDate={formatDate}
    />,
  );
  try {
    assert.match(text(), /Ada Lovelace/);
    assert.match(text(), /ada@example\.test/);
    assert.match(text(), /This browser/);
    assert.doesNotMatch(text(), /Sign out everywhere/);
    await click(button("Sign out"));
    assert.ok(auth.calls.includes("signOut"));
    assert.deepEqual(visited, ["fake://provider/logout"]);
  } finally {
    await view.unmount();
  }
});
