import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { McpAuthorization } from "../src/patterns/auth/mcp-authorization.js";
import {
  SignIn,
  authRedirectErrorMessage,
} from "../src/patterns/auth/sign-in.js";
import {
  AccessDenied,
  accessDeniedStatus,
} from "../src/patterns/auth/access-denied.js";
import { ProfileSettings } from "../src/patterns/account-settings/profile-settings.js";

const props = {
  brand: "Avgeek",
  productName: "Example product",
  client: {
    name: "Example client",
    redirectHost: "client.example.test",
    localhost: false,
  },
  ceilings: ["viewer"] as const,
  onCeilingChange: () => {},
  onApprove: () => {},
  onDeny: () => {},
};
const names = { productName: "Posted", providerName: "authentik" };

test("consent shows the client, where it returns to, what it acts on and the role ceiling", () => {
  const html = renderToStaticMarkup(
    <McpAuthorization
      {...props}
      ceiling="viewer"
      resources={[{ uri: "https://api.example.test/mcp", name: "MCP" }]}
    />,
  );
  assert.match(html, /Connect to Example product/);
  assert.match(html, /<input[^>]*disabled[^>]*value="Example client"/);
  assert.match(html, /Returns to/);
  assert.match(html, /value="client\.example\.test"/);
  assert.match(html, /Access to/);
  assert.match(html, /value="MCP"/);
  assert.match(html, /Viewer/);
  assert.match(html, /lower of this role and your own \(Viewer\)/);
  assert.doesNotMatch(html, /on your computer/);
  assert.match(html, /Back to Example client/);
  assert.ok(html.indexOf(">Deny<") < html.indexOf(">Approve<"));
});

test("a loopback redirect warns, and the registered logo is shown without a referrer", () => {
  const html = renderToStaticMarkup(
    <McpAuthorization
      {...props}
      ceiling="viewer"
      client={{
        ...props.client,
        redirectHost: "127.0.0.1:53682",
        localhost: true,
        logoUri: "https://client.example.test/logo.png",
      }}
    />,
  );
  assert.match(html, /This address is on your computer/);
  assert.match(html, /value="127\.0\.0\.1:53682"/);
  assert.match(
    html,
    /<img[^>]*src="https:\/\/client\.example\.test\/logo\.png"[^>]*referrerPolicy="no-referrer"|<img[^>]*referrerpolicy="no-referrer"[^>]*src="https:\/\/client\.example\.test\/logo\.png"/i,
  );
});

test("a ceiling above the person's role blocks approval while permitting denial", () => {
  const html = renderToStaticMarkup(
    <McpAuthorization {...props} ceiling="admin" />,
  );
  assert.match(html, /<button[^>]*disabled[^>]*>Approve<\/button>/);
  const deny = html.match(/<button[^>]*>Deny<\/button>/)?.[0];
  assert.ok(deny);
  assert.doesNotMatch(deny, /disabled/);
});

test("a workspace picker must have a choice before approval", () => {
  const workspace = {
    options: [{ id: "ops", label: "Operations" }],
    onChange: () => {},
  };
  const empty = renderToStaticMarkup(
    <McpAuthorization
      {...props}
      ceiling="viewer"
      workspace={{ ...workspace, value: "" }}
    />,
  );
  assert.match(empty, /Workspace/);
  assert.match(empty, /<button[^>]*disabled[^>]*>Approve<\/button>/);
  const chosen = renderToStaticMarkup(
    <McpAuthorization
      {...props}
      ceiling="viewer"
      workspace={{ ...workspace, value: "ops" }}
    />,
  );
  assert.doesNotMatch(chosen, /<button[^>]*disabled[^>]*>Approve<\/button>/);
});

test("pending consent disables navigation and both decisions without inline mutation errors", () => {
  const html = renderToStaticMarkup(
    <McpAuthorization
      {...props}
      ceiling="viewer"
      isPending
      error="Unable to connect"
    />,
  );
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /<button[^>]*disabled[^>]*>Deny<\/button>/);
  assert.match(
    html,
    /<button[^>]*disabled[^>]*>Back to Example client<\/button>/,
  );
  assert.doesNotMatch(html, /Unable to connect/);
});

test("sign-in is one provider button with no credential fields, and shows the redirect error", () => {
  const html = renderToStaticMarkup(
    <SignIn
      brand="Avgeek"
      {...names}
      error={{ code: "step_up_failed", reason: "mfa_missing" }}
      onContinue={() => {}}
    />,
  );
  assert.match(html, /Continue with authentik/);
  assert.match(html, /Sign in to Posted with your authentik account/);
  assert.match(html, /multi-factor authentication in authentik/);
  assert.doesNotMatch(html, /<input|password|passkey/i);
});

test("redirect error codes become human messages, and unknown codes stay general", () => {
  const message = (code: string, reason: string | null = null) =>
    authRedirectErrorMessage({ code, reason }, names);
  assert.match(
    message("sign_in_denied", "no_role"),
    /assign it to you in authentik/,
  );
  assert.match(
    message("sign_in_denied", "user_inactive"),
    /isn't active in Posted/,
  );
  assert.match(message("step_up_failed", "user"), /different person/);
  assert.match(
    message("step_up_failed", "stale"),
    /didn't ask you to sign in again/,
  );
  assert.match(message("oidc_unavailable"), /authentik isn't responding/);
  assert.match(message("rate_limited"), /Too many/);
  assert.equal(
    message("brand_new_code"),
    "Sign-in didn't complete. Try again.",
  );
  assert.equal(
    accessDeniedStatus({ code: "sign_in_denied", reason: "unassigned" }),
    "unassigned",
  );
  assert.equal(
    accessDeniedStatus({ code: "sign_in_denied", reason: "user_deleted" }),
    "inactive",
  );
  assert.equal(
    accessDeniedStatus({ code: "step_up_failed", reason: "user" }),
    null,
  );
  assert.equal(accessDeniedStatus(null), null);
});

test("access denial points to the provider for every status and offers no in-app request", () => {
  const unassigned = renderToStaticMarkup(
    <AccessDenied brand="Avgeek" {...names} onTryAgain={() => {}} />,
  );
  assert.match(
    unassigned,
    /You don&#x27;t have access to Posted\. Ask an admin to assign it to you in authentik\./,
  );
  assert.match(unassigned, />Try again</);
  const suspended = renderToStaticMarkup(
    <AccessDenied
      brand="Avgeek"
      {...names}
      status="suspended"
      email="ada@example.test"
    />,
  );
  assert.match(suspended, /Access suspended/);
  assert.match(suspended, /ada@example\.test/);
  assert.doesNotMatch(suspended, /<button/);
  assert.match(
    renderToStaticMarkup(
      <AccessDenied brand="Avgeek" {...names} status="inactive" />,
    ),
    /Account not active/,
  );
});

test("the profile is read-only and says where it is managed", () => {
  const html = renderToStaticMarkup(
    <ProfileSettings
      name="Ada Lovelace"
      email="ada@example.test"
      role="admin"
      providerName="authentik"
      manageUrl="https://auth.example.test/if/user/"
    />,
  );
  assert.match(html, /Ada Lovelace/);
  assert.match(html, /ada@example\.test/);
  assert.match(html, /Admin/);
  assert.match(html, /come from authentik and are changed there/);
  assert.match(html, /href="https:\/\/auth\.example\.test\/if\/user\/"/);
  assert.doesNotMatch(html, /<input|<button|<form/);
});
