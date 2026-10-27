import { test, expect, focusRowAction, settleFocus } from "./fixtures.mjs";

test("API-key confirmation restores its connected row action after Escape and Cancel", async ({
  page,
  fixtureUrl,
  touch,
}) => {
  await page.goto(
    fixtureUrl(
      "stories/Patterns/Account Settings/ApiKeysSettings.stories.tsx",
      "Focus return",
    ),
  );
  await page.bringToFront();
  await expect(page.locator("body.sb-show-main")).toBeVisible();
  const opener = page.getByRole("button", { name: "Revoke", exact: true });
  const dialog = page.getByRole("dialog", { name: "Revoke Automation?" });
  for (const [index, dismissal] of ["Escape", "Cancel", "Escape"].entries()) {
    if (index === 0) await focusRowAction(page, opener);
    else {
      // The previous dismissal returned focus to the opener; it must still
      // hold once the grid has applied any deferred focus move.
      await settleFocus(page);
      await expect(opener).toBeFocused();
    }
    if (touch) await opener.tap();
    else await page.keyboard.press("Enter");
    await expect(dialog).toBeVisible();
    await expect
      .poll(() =>
        dialog.evaluate((element) =>
          element.contains(globalThis.document.activeElement),
        ),
      )
      .toBe(true);
    const original = await opener.elementHandle();
    if (dismissal === "Escape") await page.keyboard.press("Escape");
    else
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
    expect(await original.evaluate((element) => element.isConnected)).toBe(
      true,
    );
    await opener.evaluate((element) => element.closest('[role="row"]').focus());
    await expect(opener).toBeFocused();
  }
});

test("API-key confirmation recovery preserves deliberate destination focus", async ({
  page,
  fixtureUrl,
}) => {
  await page.goto(
    fixtureUrl(
      "stories/Patterns/Account Settings/ApiKeysSettings.stories.tsx",
      "Focus return",
    ),
  );
  await page.bringToFront();
  const opener = page.getByRole("button", { name: "Revoke", exact: true });
  await opener.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.evaluate(() => new Promise(globalThis.requestAnimationFrame));
  const destination = page.getByRole("button", {
    name: "Other action",
    exact: true,
  });
  await destination.focus();
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        globalThis.requestAnimationFrame(() =>
          globalThis.requestAnimationFrame(resolve),
        ),
      ),
  );
  await expect(destination).toBeFocused();
});
