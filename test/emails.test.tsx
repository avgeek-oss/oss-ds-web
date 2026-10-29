import assert from "node:assert/strict";
import { test } from "node:test";
import { authEmailTemplates } from "../src/emails/auth-email.js";
import { renderAuthEmail, renderEmailMessage } from "../src/emails/render.js";
for (const app of ["Towbar", "Mill", "Rootset", "Vitalog"]) {
  test(`${app} authentication templates escape data and render HTML and plain text`, async () => {
    for (const template of authEmailTemplates) {
      const email = await renderAuthEmail(template, {
        brand: { name: app, accentColor: "#0866bd" },
        name: "<ScRiPt>name</ScRiPt>",
        teamName: "Research & <Team>",
        actionUrl: "https://example.test/action#secret-token",
        providerName: "authentik",
        role: "viewer",
      });
      assert.match(email.subject, new RegExp(`^\\[${app}\\] `));
      assert.match(email.html, /&lt;script&gt;name&lt;\/script&gt;/i);
      assert.doesNotMatch(email.html, /<script\b/i);
      assert.ok(
        email.text.includes("https://example.test/action#secret-token"),
      );
      assert.match(email.html, /Research &amp; &lt;Team&gt;/);
      assert.ok(email.text.includes("Research & <Team>"));
      assert.doesNotMatch(email.text, /TOTP|authenticator/i);
      if (app !== "Towbar") assert.doesNotMatch(email.text, /Towbar/);
      assert.doesNotMatch(email.text, /password|passkey|invitation/i);
    }
  });
}
test("email links reject executable protocols and credentials, and branding rejects CSS injection", async () => {
  for (const actionUrl of [
    "javascript:alert(1)",
    "data:text/html,x",
    "https://name:password@example.test/action",
  ]) {
    await assert.rejects(
      renderAuthEmail("role-changed", {
        brand: { name: "Example", accentColor: "#0866bd" },
        actionUrl,
      }),
    );
  }
  await assert.rejects(
    renderAuthEmail("role-changed", {
      brand: { name: "Example", accentColor: "red;background:url(x)" },
    }),
  );
  await assert.rejects(
    renderAuthEmail("role-changed", {
      brand: {
        name: "Example",
        accentColor: "#0866bd",
        logoUrl: "javascript:alert(1)",
      },
    }),
  );
  const result = await renderEmailMessage({
    brand: { name: "App\r\nInjected", accentColor: "#0866bd" },
    message: {
      title: "Update\nInjected",
      paragraphs: ["Update."],
      details: [{ label: "Name", value: "<img src=x>" }],
    },
  });
  assert.doesNotMatch(result.subject, /[\r\n]/);
  assert.doesNotMatch(result.html, /<img src=x>/);
  assert.match(result.html, /&lt;img src=x&gt;/);
});

test("role changes without a role do not invent permissions and name the provider", async () => {
  const email = await renderAuthEmail("role-changed", {
    brand: { name: "Example", accentColor: "#0866bd" },
  });
  assert.match(email.text, /Your role in Example changed\./);
  assert.doesNotMatch(email.text, /Member|Create and update/);
  assert.match(email.text, /your organisation's identity provider/);
  const removed = await renderAuthEmail("access-removed", {
    brand: { name: "Example", accentColor: "#0866bd" },
    providerName: "authentik",
  });
  assert.match(removed.text, /removed in authentik/);
  assert.match(removed.text, /sessions, API keys and connected apps/);
});

test("application email themes keep button text independent of the surface and render the brand name", async () => {
  const email = await renderAuthEmail("role-changed", {
    brand: {
      name: "Rootset",
      accentColor: "#2d5e44",
      logoUrl: "https://example.test/logo.png",
      theme: {
        surface: "#f8faf9",
        foreground: "#22352a",
        muted: "#65766b",
        accentForeground: "#fafffc",
      },
    },
    actionUrl: "https://example.test/reset",
  });
  assert.match(email.html, /background-color:#f8faf9/);
  assert.match(email.html, /color:#22352a/);
  assert.match(email.html, /color:#65766b/);
  assert.match(email.html, /background-color:#2d5e44;color:#fafffc/);
  assert.match(email.html, />Rootset<|>\s*Rootset\s*</);
  assert.match(email.text, /Rootset/);
  for (const key of ["surface", "foreground", "muted", "accentForeground"]) {
    await assert.rejects(
      renderAuthEmail("role-changed", {
        brand: {
          name: "Example",
          accentColor: "#2d5e44",
          theme: { [key]: "red;background:url(x)" },
        },
      }),
      /six-digit hex/,
    );
  }
});
