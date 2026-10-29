import assert from "node:assert/strict";
import { test, expect } from "./fixtures.mjs";

const contracts = [
  {
    name: "CodeBlock",
    fixture: "stories/Primitives/Typography/CodeBlock.stories.tsx",
    action: "Copy code",
    label: "Copy",
    content: '[data-slot="code-block-code"]',
    value: "Plain text",
    success: "Copied to clipboard.",
    failure:
      "Could not copy to the clipboard. Select and copy the text instead.",
  },
];

async function holdClipboard(page) {
  await page.addInitScript(() => {
    globalThis.copyWrites = 0;
    globalThis.copiedValues = [];
    Object.defineProperty(globalThis.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: (value) => {
          globalThis.copiedValues.push(value);
          globalThis.copyWrites++;
          return new Promise((resolve, reject) => {
            globalThis.finishCopy = resolve;
            globalThis.failCopy = reject;
          });
        },
      },
    });
  });
}

for (const contract of contracts) {
  test(`${contract.name} clipboard writes lock repeated presses and allow retry after failure`, async ({
    page,
    fixtureUrl,
    touch,
    theme,
  }, testInfo) => {
    await holdClipboard(page);
    await page.goto(fixtureUrl(contract.fixture));
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const copy = page
      .getByRole("button", { name: contract.action, exact: true })
      .first();
    await copy.focus();
    await copy.evaluate((element) => {
      element.click();
      element.click();
    });
    assert.equal(await page.evaluate(() => globalThis.copyWrites), 1);
    await expect(copy).toBeDisabled();
    await expect(copy).toBeFocused();
    await expect(copy).toHaveText(contract.label);
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
    await page.evaluate(() =>
      globalThis.failCopy(new Error("Clipboard denied")),
    );
    const danger = page.locator('[data-slot="toast"]:not([data-exiting])');
    await expect(danger).toHaveCount(1);
    await expect(danger).toBeInViewport({ ratio: 1 });
    await expect(danger).toContainText(contract.failure);
    await expect(copy).toBeEnabled();
    await expect(page.locator(contract.content).first()).toContainText(
      contract.value,
    );
    const dangerClose = danger.locator('[data-slot="toast-close"]');
    if (touch) await dangerClose.tap();
    else {
      await dangerClose.focus();
      await page.keyboard.press("Enter");
    }
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
    await copy.focus();
    if (touch) await copy.tap();
    else await page.keyboard.press("Enter");
    assert.equal(await page.evaluate(() => globalThis.copyWrites), 2);
    await page.evaluate(() => globalThis.finishCopy());
    const success = page.locator('[data-slot="toast"]:not([data-exiting])');
    await expect(success).toHaveCount(1);
    await expect(success).toContainText(contract.success);
    await expect(copy).toHaveText(contract.label);
    await expect(copy).toHaveAccessibleName(contract.action);
    await expect(copy).toBeEnabled();
    assert.ok(
      (await page.evaluate(() => globalThis.copiedValues)).every((value) =>
        value.includes(contract.value),
      ),
    );
    await expect(success).toBeInViewport({ ratio: 1 });
    await page.screenshot({
      path: testInfo.outputPath("preview.png"),
    });
    await success.locator('[data-slot="toast-close"]').click();
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
    await page.evaluate(() =>
      Reflect.deleteProperty(globalThis.navigator, "clipboard"),
    );
    for (let attempt = 0; attempt < 2; attempt++) {
      await copy.click();
      await expect(danger).toHaveCount(1);
      await expect(danger).toContainText(contract.failure);
      await expect(copy).toBeEnabled();
      await expect(page.locator(contract.content).first()).toContainText(
        contract.value,
      );
      await expect(copy).toHaveText(contract.label);
      await dangerClose.click();
      await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
    }
    assert.equal(
      await page.evaluate(() => globalThis.copyWrites),
      2,
      "Unsupported clipboard must not fabricate writes",
    );
  });
}

for (const contract of contracts) {
  for (const settlement of ["resolve", "reject"]) {
    test(`${contract.name} ignores a clipboard ${settlement} after suspension or owner change and allows fresh feedback`, async ({
      page,
      fixtureUrl,
    }) => {
      await holdClipboard(page);
      await page.goto(
        fixtureUrl(
          "stories/Primitives/Overlays/OverlaySuspensionScope.stories.tsx",
          contract.name,
        ),
      );
      await page.bringToFront();
      const copy = page.getByRole("button", {
        name: contract.action,
        exact: true,
      });
      const finish = async () =>
        page.evaluate((outcome) => {
          if (outcome === "resolve") globalThis.finishCopy();
          else globalThis.failCopy(new Error("Clipboard denied"));
        }, settlement);
      await copy.click();
      await expect(copy).toBeDisabled();
      await page.evaluate(() =>
        globalThis.dispatchEvent(new Event("preview:suspend")),
      );
      await page
        .getByRole("button", { name: "Resume same account", exact: true })
        .click();
      await expect(copy).toBeDisabled();
      await finish();
      await expect(copy).toBeEnabled();
      await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
      await copy.click();
      await finish();
      const toast = page.locator('[data-slot="toast"]');
      await expect(toast).toHaveCount(1);
      await expect(toast).toContainText(
        settlement === "resolve" ? contract.success : contract.failure,
      );
      await toast.locator('[data-slot="toast-close"]').click();
      await expect(toast).toHaveCount(0);
      await copy.click();
      await page.evaluate(() =>
        globalThis.dispatchEvent(new Event("preview:suspend")),
      );
      await page
        .getByRole("button", { name: "Switch account", exact: true })
        .click();
      await finish();
      await expect(copy).toBeEnabled();
      await expect(toast).toHaveCount(0);
      expect(await page.evaluate(() => globalThis.copyWrites)).toBe(3);
    });
  }
}
