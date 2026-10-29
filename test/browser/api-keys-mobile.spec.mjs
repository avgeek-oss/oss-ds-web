import { test, expect, focusRowAction, settleFocus } from "./fixtures.mjs";

test("Codex metadata connections show a friendly name, logo, role and disconnect title", async ({
  page,
  fixtureUrl,
  width,
}, testInfo) => {
  await page.goto(
    fixtureUrl(
      "stories/Patterns/Account Settings/McpConnectionsSettings.stories.tsx",
    ),
  );
  await page.bringToFront();
  const table = page.getByRole("grid", { name: "Connected apps" });
  const codex = table.getByRole("rowheader").first();
  await expect(codex).toContainText("Codex");
  const name = codex.getByText("Codex", { exact: true });
  await expect(name).toBeVisible();
  expect((await name.boundingBox()).width).toBeGreaterThan(40);
  await expect(codex.locator("svg")).toHaveCount(1);
  await expect(table).toContainText("Admin");
  await expect(table.getByRole("columnheader")).toHaveText([
    "App",
    "Role",
    "Connected",
    "Last used",
    "Actions",
  ]);
  const cells = table.getByRole("row").nth(1).locator(".table__cell");
  const positions = await cells.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().top),
  );
  expect(new Set(positions).size).toBe(1);
  await expect(table.getByRole("rowheader").nth(1)).toContainText(
    "Example app",
  );
  expect(
    await page.evaluate(() => globalThis.document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(width);
  await page.screenshot({
    path: testInfo.outputPath("mcp-connections.png"),
    animations: "disabled",
  });
  const revoke = table
    .getByRole("button", { name: "Disconnect", exact: true })
    .first();
  await focusRowAction(page, revoke);
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", {
    name: "Disconnect Codex?",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(revoke).toBeFocused();
  await revoke.click();
  await dialog.getByRole("button", { name: "Disconnect", exact: true }).click();
  await expect(table.getByRole("rowheader")).toHaveCount(1);
  await expect(table.getByRole("rowheader")).toContainText("Example app");
});

test("API keys retain every field, native row headers and reachable actions at mobile and desktop widths", async ({
  page,
  fixtureUrl,
  touch,
  width,
}, testInfo) => {
  await page.goto(
    fixtureUrl(
      "stories/Patterns/Account Settings/ApiKeysSettings.stories.tsx",
      "Responsive details",
    ),
  );
  await page.bringToFront();
  const table = page.getByRole("grid", { name: "API keys" });
  await expect(table).toBeVisible();
  await expect(table.getByRole("columnheader")).toHaveText([
    "Name",
    "Role",
    "Added",
    "Expires",
    "Last used",
    "Actions",
  ]);
  await expect(table.getByRole("rowheader")).toHaveCount(3);
  await expect(table.getByRole("rowheader").first()).toContainText(
    "Automation key with a long identifiable name for release operations",
  );
  await expect(table.getByText("Active", { exact: true })).toHaveCount(0);
  const expiry = table.getByRole("row").nth(3).getByRole("gridcell").nth(2);
  await expect(expiry).toContainText("Expired");
  await expect(expiry).toContainText("2000-01-01");
  await expect(
    table.getByRole("row").nth(1).getByRole("gridcell").first(),
  ).toHaveText("Member");
  for (const date of ["2026-10-01", "2099-12-30", "2026-10-06"])
    await expect(table.getByText(date, { exact: true }).first()).toBeVisible();
  for (const description of await table
    .locator('[data-slot="table-cell-description"]')
    .all()) {
    const dimensions = await description.evaluate((element) => ({
      height: element.getBoundingClientRect().height,
      lineHeight: Number.parseFloat(
        globalThis.getComputedStyle(element).lineHeight,
      ),
    }));
    expect(dimensions.height).toBeLessThanOrEqual(dimensions.lineHeight);
  }
  await expect(
    table.getByRole("gridcell", { name: "No expiry", exact: true }),
  ).toBeVisible();
  await expect(
    table.getByRole("row", { name: /Reporting/ }).getByRole("gridcell", {
      name: "Never",
      exact: true,
    }),
  ).toBeVisible();
  const bounds = await table.evaluate((element) => {
    const container = element.closest(".table__scroll-container");
    const rect = container.getBoundingClientRect();
    return {
      scrollWidth: container.scrollWidth,
      width: container.clientWidth,
      left: rect.left,
      right: rect.right,
      pageWidth: globalThis.document.documentElement.scrollWidth,
    };
  });
  if (touch) expect(bounds.scrollWidth).toBeGreaterThan(bounds.width);
  expect(bounds.pageWidth).toBeLessThanOrEqual(width);
  const cells = table.getByRole("row").nth(1).locator(".table__cell");
  await expect(cells).toHaveCount(6);
  const positions = await cells.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().top),
  );
  expect(new Set(positions).size).toBe(1);
  await table.evaluate((element) => {
    const container = element.closest(".table__scroll-container");
    container.scrollLeft = container.scrollWidth;
  });
  const revoke = table
    .getByRole("button", { name: "Revoke", exact: true })
    .first();
  const actionBounds = await revoke.boundingBox();
  expect(actionBounds.x).toBeGreaterThanOrEqual(bounds.left - 1);
  expect(actionBounds.x + actionBounds.width).toBeLessThanOrEqual(
    bounds.right + 1,
  );
  await page.screenshot({
    path: testInfo.outputPath("metadata.png"),
    animations: "disabled",
  });
  await focusRowAction(page, revoke);
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: /Revoke Automation key/ });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await settleFocus(page);
  await expect(revoke).toBeFocused();
  if (touch) await revoke.tap();
  else await page.keyboard.press("Enter");
  await expect(dialog).toBeVisible();
  const confirm = dialog.getByRole("button", {
    name: "Revoke key",
    exact: true,
  });
  await confirm.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await expect(
    page.getByText("Simulated requests: 1", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("alert")).toContainText(
    "Revocation failed. Please retry.",
  );
  await expect(dialog).toBeVisible();
  await expect(table.getByRole("rowheader")).toHaveCount(3);
  await page.locator('[data-slot="toast-close"]').click();
  await confirm.focus();
  await page.keyboard.press("Enter");
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByText("Simulated requests: 2", { exact: true }),
  ).toBeVisible();
  await expect(table.getByRole("rowheader")).toHaveCount(2);
  await expect(table.getByRole("rowheader").first()).toContainText("Reporting");
  await expect(
    table.getByRole("button", { name: "Revoke", exact: true }).first(),
  ).toBeVisible();
});

test("people identity remains visible beside role, source and last sign-in on narrow tables", async ({
  page,
  fixtureUrl,
  width,
}) => {
  await page.goto(
    fixtureUrl("stories/Patterns/Team Settings/PeopleDirectory.stories.tsx"),
  );
  const table = page.getByRole("grid", { name: "People", exact: true });
  await expect(table).toBeVisible();
  const row = table.getByRole("rowheader").first();
  const identity = row.locator('[data-slot="tooltip-trigger"]');
  await expect(identity).toHaveCount(2);
  for (const label of await identity.all()) {
    await expect(label).toBeVisible();
    expect((await label.boundingBox()).width).toBeGreaterThan(0);
  }
  await expect(row).toContainText("(you)");
  await expect(table.getByRole("columnheader")).toHaveText([
    "Person",
    "Role",
    "Source",
    "Last sign-in",
  ]);
  await expect(table.getByText("Suspended", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(() => globalThis.document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(width);
});
