import { test, expect } from "./fixtures.mjs";

const fixture = "stories/Patterns/Auth/McpAuthorization.stories.tsx";

test("MCP consent defaults to the viewer ceiling, shows where it returns and permits an explicit admin choice", async ({
  page,
  fixtureUrl,
}) => {
  await page.goto(fixtureUrl(fixture, "Master"));
  await expect(
    page.getByRole("heading", { name: "Connect to Towbar" }),
  ).toBeVisible();
  await expect(page.getByLabel("Application", { exact: true })).toBeDisabled();
  await expect(page.getByLabel("Returns to", { exact: true })).toHaveValue(
    "client.example.test",
  );
  await expect(page.getByText("This address is on your computer")).toHaveCount(
    0,
  );
  const scope = page.getByRole("button", { name: /Role/ });
  await expect(scope).toContainText("Viewer");
  await scope.click();
  await page.getByRole("option", { name: /^Admin/ }).click();
  await expect(scope).toContainText("Admin");
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  await expect(
    page.getByText("Preview connection approved", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        globalThis.document.documentElement.scrollWidth <=
        globalThis.innerWidth,
    ),
  ).toBe(true);
});

test("MCP consent disables ceilings beyond the current role and returns to the client through denial", async ({
  page,
  fixtureUrl,
}) => {
  await page.goto(fixtureUrl(fixture, "Viewer"));
  await page.getByRole("button", { name: /Role/ }).click();
  for (const name of [/^Member/, /^Admin/]) {
    await expect(page.getByRole("option", { name })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  }
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Back to Example MCP client", exact: true })
    .click();
  await expect(
    page.getByText("Preview connection denied", { exact: true }),
  ).toBeVisible();
});

test("MCP consent locks scope, approval and return while a decision is pending", async ({
  page,
  fixtureUrl,
}) => {
  await page.goto(fixtureUrl(fixture, "Pending"));
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  for (const name of ["Approve", "Deny", "Back to Example MCP client"]) {
    await expect(
      page.getByRole("button", { name, exact: true }),
    ).toBeDisabled();
  }
  await expect(page.getByRole("button", { name: /Role/ })).toBeDisabled();
  await expect(
    page.getByText("Preview connection approved", { exact: true }),
  ).toBeVisible();
});

test("MCP consent keeps unbroken client names within the viewport", async ({
  page,
  fixtureUrl,
}) => {
  await page.goto(fixtureUrl(fixture, "Long client name"));
  await expect(page.getByLabel("Application", { exact: true })).toHaveValue(
    "M".repeat(100),
  );
  const back = page.getByRole("button", {
    name: "Back to " + "M".repeat(100),
    exact: true,
  });
  await expect(back).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        globalThis.document.documentElement.scrollWidth <=
        globalThis.innerWidth,
    ),
  ).toBe(true);
  await back.click();
  await expect(
    page.getByText("Preview connection denied", { exact: true }),
  ).toBeVisible();
});

test("MCP consent warns about a redirect to this computer and requires a workspace when offered", async ({
  page,
  fixtureUrl,
}) => {
  await page.goto(fixtureUrl(fixture, "Localhost"));
  await expect(
    page.getByText("This address is on your computer"),
  ).toBeVisible();
  await expect(page.getByLabel("Returns to", { exact: true })).toHaveValue(
    "127.0.0.1:53682",
  );
  await page.goto(fixtureUrl(fixture, "Workspace"));
  const approve = page.getByRole("button", { name: "Approve", exact: true });
  await expect(approve).toBeDisabled();
  await page.getByRole("button", { name: /Workspace/ }).click();
  await page.getByRole("option", { name: "Fleet", exact: true }).click();
  await expect(approve).toBeEnabled();
});
