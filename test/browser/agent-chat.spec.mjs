import assert from "node:assert/strict";
import { test, expect } from "./fixtures.mjs";

const story = [
  "stories/Patterns/Agent Chat/AgentChat.stories.tsx",
  "In Application Shell",
];

test("the agent panel docks beside the page and approvals continue the conversation", async ({
  page,
  fixtureUrl,
  width,
}) => {
  test.skip(width < 1024, "Docked layout applies from 64rem");
  await page.goto(fixtureUrl(...story));
  const panel = page.locator("aside[data-slot='app-aside']");
  const table = page
    .getByRole("grid", { name: "Services" })
    .or(page.getByRole("table", { name: "Services" }));
  await expect(panel.getByRole("heading", { name: "Assistant" })).toBeVisible();
  const [tableBox, panelBox] = await Promise.all([
    table.boundingBox(),
    panel.boundingBox(),
  ]);
  assert.ok(tableBox && panelBox);
  assert.ok(
    tableBox.x + tableBox.width <= panelBox.x + 1,
    "The open panel sits beside the page rather than over it",
  );

  await panel.getByRole("button", { name: "Close assistant" }).click();
  await expect(panel).toHaveAttribute("inert", "");
  const trigger = page.getByRole("button", {
    name: "Assistant, an action needs your approval",
  });
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(panel).not.toHaveAttribute("inert", "");
  const card = panel.getByRole("group", {
    name: "Approve: Restart billing-worker",
  });
  await card.getByRole("button", { name: "Approve" }).click();
  await expect(card).toHaveCount(0);
  await expect(panel.getByText("picked up 18 queued jobs")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Assistant$/ })).toBeVisible();
});

test("small screens show the agent panel as a full-width drawer, one drawer at a time", async ({
  page,
  fixtureUrl,
  width,
}) => {
  test.skip(width >= 1024, "Drawer layout applies below 64rem");
  await page.goto(fixtureUrl(...story));
  const assistant = page.getByRole("dialog", { name: "Assistant" });
  await expect(assistant).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Navigation" })).toHaveCount(0);
  const box = await assistant.boundingBox();
  assert.ok(box && Math.abs(box.width - width) <= 1, "Drawer spans the screen");

  await assistant.getByRole("button", { name: "Close assistant" }).tap();
  await expect(assistant).toHaveCount(0);

  await page.getByRole("button", { name: /^Assistant/ }).tap();
  await expect(assistant).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(assistant).toHaveCount(0);

  await page.getByRole("button", { name: "Toggle navigation" }).tap();
  await expect(page.getByRole("dialog", { name: "Navigation" })).toBeVisible();
  await expect(assistant).toHaveCount(0);
});
