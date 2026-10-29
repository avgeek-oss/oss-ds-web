import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "../src/buttons/button.js";
import { Page } from "../src/layouts/page.js";
import { IdentityAuthHeading } from "../src/patterns/auth/identity-auth-frame.js";
import {
  McpClientLogo,
  mcpClientConfigurations,
  mcpClientPresentation,
} from "../src/utilities/mcp-client-presentation.js";
import {
  availableTimeZones,
  isTimeZone,
} from "../src/utilities/date-time-preferences.js";
import { FieldError } from "../src/forms/field.js";
import { TextField } from "../src/patterns/text-field.js";
import {
  RelativeTime,
  formatRelativeTime,
} from "../src/data-display/relative-time.js";
import {
  createNameSchema,
  createInvitationSchema,
  invitationSchema,
} from "../src/patterns/settings/schemas.js";

test("Codex names and metadata identifiers use ChatGPT branding without changing trust", () => {
  const trust = { label: "Unverified", color: "warning" } as const;
  for (const name of [
    "Codex",
    " codex ",
    "https://chatgpt.com/oauth/codex/client.json",
    "https://chatgpt.com/oauth/codex/YddBjjAsi-xR/client.json",
  ]) {
    const client = { name, trust, logo: <span>Generic logo</span> };
    const display = mcpClientPresentation(client);
    assert.equal(display.name, "Codex");
    assert.notEqual(display.logo, client.logo);
    assert.equal(display.trust, trust);
    assert.equal(client.name, name);
  }
  const id = "https://chatgpt.com/oauth/codex/client.json";
  assert.equal(mcpClientPresentation({ name: "MCP client", id }).name, "Codex");
  assert.equal(mcpClientPresentation({ name: "MCP client", id }).id, id);
  for (const name of [
    "Example app",
    "https://chatgpt.com.example.test/oauth/codex/client.json",
    "https://chatgpt.com@example.test/oauth/codex/client.json",
    "http://chatgpt.com/oauth/codex/client.json",
    "https://chatgpt.com/other/client.json",
  ]) {
    const client = { name, logo: <span>App logo</span> };
    assert.equal(mcpClientPresentation(client), client);
  }
});

test("common name limits, explicit domain limits and strict invitation fields are preserved", () => {
  assert.equal(createNameSchema().safeParse("x".repeat(120)).success, true);
  assert.equal(createNameSchema().safeParse("x".repeat(121)).success, false);
  assert.equal(createNameSchema().safeParse("   ").success, false);
  assert.equal(createNameSchema(100).safeParse("x".repeat(101)).success, false);
  assert.equal(createNameSchema(120).safeParse("x".repeat(101)).success, true);
  assert.equal(
    invitationSchema.safeParse({ email: "alex@example.test", role: "owner" })
      .success,
    false,
  );
  assert.equal(
    invitationSchema.safeParse({
      email: "alex@example.test",
      role: "admin",
      permissions: ["everything"],
    }).success,
    false,
  );
});
test("buttons and auth headings retain accessible names and semantics", () => {
  const button = renderToStaticMarkup(
    <Button variant="secondary" aria-label="Cancel invitation">
      Cancel
    </Button>,
  );
  assert.match(button, /aria-label="Cancel invitation"/);
  const heading = renderToStaticMarkup(
    <IdentityAuthHeading title="Sign in" titleElementType="h1">
      Sign in to your instance.
    </IdentityAuthHeading>,
  );
  assert.match(heading, /<h1[^>]*>Sign in<\/h1>/);
  assert.match(heading, /text-xl/);
  assert.match(heading, /text-sm/);
});
test("the shared runtime has no Next.js or application package dependency", async () => {
  async function check(directory: string) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.name === "adapters") continue;
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory()) await check(path);
      else if (/\.tsx?$/.test(entry.name)) {
        const text = await readFile(path, "utf8");
        assert.doesNotMatch(
          text,
          /from ["'](?:next(?:\/|["'])|@workspace\/|@mill\/|@avgeek-inc\/)/,
          path,
        );
      }
    }
  }
  await check("src");
});

test("distinct domain role validation does not broaden common team roles", () => {
  const domainRoles = createInvitationSchema(["owner", "contributor"]);
  assert.equal(
    domainRoles.safeParse({ email: "alex@example.test", role: "contributor" })
      .success,
    true,
  );
  assert.equal(
    domainRoles.safeParse({ email: "alex@example.test", role: "member" })
      .success,
    false,
  );
  assert.equal(
    invitationSchema.safeParse({
      email: "alex@example.test",
      role: "contributor",
    }).success,
    false,
  );
});

test("structured data cannot close its script element and preserves its values", () => {
  const data = {
    name: '</script><script>alert("untrusted")</script>',
    alternate: '</ScRiPt ><SCRIPT>alert("untrusted")</SCRIPT>',
    comparison: "a < b",
  };
  const markup = renderToStaticMarkup(
    <Page structuredData={data}>Content</Page>,
  );
  const scripts = markup.split('<script type="application/ld+json">');
  assert.equal(scripts.length, 2);
  const closing = scripts[1]?.split("</script>");
  assert.equal(closing?.length, 2);
  const content = closing?.[0];
  assert.ok(content);
  assert.doesNotMatch(content, /</);
  assert.deepEqual(JSON.parse(content), data);
});

test("date/time range composition keeps two labeled segmented fields and native disabled state", async () => {
  const { DateTimeRangePicker } =
    await import("../src/patterns/date-time-range-picker.js");
  const { parseDateTime } = await import("@internationalized/date");
  const markup = renderToStaticMarkup(
    <DateTimeRangePicker
      label="Log range"
      locale="en-GB"
      isDisabled
      hourCycle={24}
      value={{
        start: parseDateTime("2026-10-14T09:15"),
        end: parseDateTime("2026-10-14T10:45"),
      }}
    />,
  );
  assert.match(markup, /Start date and time/);
  assert.match(markup, /End date and time/);
  assert.match(markup, /Choose date range/);
  assert.match(markup, /disabled/);
  assert.match(markup, /09/);
  assert.match(markup, /45/);
});

test("new public entry points resolve to their sources and the root carries the shared exports", async () => {
  const manifest = JSON.parse(await readFile("package.json", "utf8")) as {
    exports: Record<string, string | { import: string }>;
  };
  for (const entry of [
    "utilities/mcp-client-presentation",
    "data-display/relative-time",
    "patterns/text-field",
    "patterns/date-picker-field",
    "overlays/dialog",
  ]) {
    const target = manifest.exports[`./${entry}`];
    assert.ok(typeof target === "object", entry);
    assert.equal(target.import, `./dist/${entry}.js`);
    await readFile(`src/${entry}.tsx`);
  }
  // The root barrel imports CSS modules, so its export list is read as text.
  const root = await readFile("src/index.ts", "utf8");
  for (const name of [
    "RouterProvider",
    "Header",
    "PortalProvider",
    "RelativeTime",
    "formatRelativeTime",
    "useCurrentTime",
    "McpClientLogo",
    "mcpClientConfigurations",
    "DatePickerField",
    "isTimeZone",
    "availableTimeZones",
  ])
    assert.match(root, new RegExp(`(?:[{,\\s]|as )${name}[\\s,}]`), name);
});

test("time-zone helpers accept IANA names only and list UTC first without duplicates", async () => {
  for (const zone of ["UTC", "Asia/Kolkata", "America/New_York"])
    assert.equal(isTimeZone(zone), true, zone);
  for (const value of ["", "+05:30", "-0800", "Not/AZone", "x".repeat(101)])
    assert.equal(isTimeZone(value), false, value);
  const zones = availableTimeZones();
  assert.equal(zones[0], "UTC");
  assert.equal(new Set(zones).size, zones.length);
  assert.ok(zones.includes("Asia/Kolkata"));
  assert.ok(zones.every(isTimeZone));
  // API packages import this subpath, so it must stay free of imports.
  const source = await readFile(
    "src/utilities/date-time-preferences.ts",
    "utf8",
  );
  assert.doesNotMatch(source, /^import /m);
});

test("MCP client configurations name the server, quote the URL for the shell and end with connection details", () => {
  const url = "https://example.test/mcp?team=o'neil";
  const configurations = mcpClientConfigurations({ serverName: "mill", url });
  assert.deepEqual(
    configurations.map(({ id, label, filename }) => [id, label, filename]),
    [
      ["codex", "Codex", "~/.codex/config.toml"],
      ["claude", "Claude Code", "Claude Code"],
      ["cursor", "Cursor", ".cursor/mcp.json"],
      ["vscode", "VS Code", ".vscode/mcp.json"],
      ["other", "Other clients", "Connection details"],
    ],
  );
  const code = Object.fromEntries(
    configurations.map((entry) => [entry.id, entry.code]),
  );
  assert.equal(code.codex, `[mcp_servers.mill]\nurl = ${JSON.stringify(url)}`);
  assert.equal(
    code.claude,
    "claude mcp add --transport http mill 'https://example.test/mcp?team=o'\\''neil'",
  );
  assert.deepEqual(JSON.parse(code.cursor ?? ""), {
    mcpServers: { mill: { url } },
  });
  assert.deepEqual(JSON.parse(code.vscode ?? ""), {
    servers: { mill: { type: "http", url } },
  });
  assert.match(code.other ?? "", /Streamable HTTP[\s\S]*Authentication: OAuth/);
  assert.ok(configurations.every((entry) => entry.icon));
  const vscode = renderToStaticMarkup(<McpClientLogo client="vscode" />);
  assert.match(vscode, /viewBox="0 0 96 96"/);
  assert.match(vscode, /aria-hidden="true"/);
  assert.equal(
    renderToStaticMarkup(<McpClientLogo client="openai" />),
    renderToStaticMarkup(<McpClientLogo client="codex" />),
  );
  assert.doesNotMatch(
    renderToStaticMarkup(<McpClientLogo client="unknown" />),
    /viewBox="0 0 96 96"|M9\.205/,
  );
});

test("field errors stay inline alerts and text fields link their descriptions", () => {
  assert.match(
    renderToStaticMarkup(<FieldError>Name is required</FieldError>),
    /<p role="alert"[^>]*>Name is required<\/p>/,
  );
  const markup = renderToStaticMarkup(
    <TextField
      id="handle"
      label="Handle"
      description="Your public name."
      aria-describedby="hint"
      required
    />,
  );
  assert.match(markup, /<label[^>]*for="handle"/);
  assert.match(markup, /<input[^>]*aria-describedby="hint handle-description"/);
  assert.match(markup, /id="handle-description"[^>]*>Your public name\./);
  assert.match(
    renderToStaticMarkup(<TextField label="Notes" multiline />),
    /<textarea/,
  );
});

test("relative time is relative only on the client and formats units through Intl", () => {
  const now = Date.parse("2026-10-29T12:00:00Z");
  assert.equal(formatRelativeTime(now - 10_000, now, "en"), "now");
  assert.equal(
    formatRelativeTime(now - 5 * 60_000, now, "en"),
    "5 minutes ago",
  );
  assert.equal(
    formatRelativeTime(now + 3 * 86_400_000, now, "en"),
    "in 3 days",
  );
  assert.equal(
    formatRelativeTime(now - 400 * 86_400_000, now, "en"),
    "1 year ago",
  );
  const markup = renderToStaticMarkup(
    <RelativeTime
      value="2026-10-29T11:55:00Z"
      label="Last synced"
      formatAbsolute={() => "29 Oct 2026, 11:55"}
      timeZone="UTC"
    />,
  );
  assert.match(markup, /aria-label="Last synced: 29 Oct 2026, 11:55 UTC"/);
  assert.match(markup, /datetime="2026-10-29T11:55:00Z"/i);
  assert.doesNotMatch(markup, />[^<]*(?:ago|now)[^<]*</);
});
