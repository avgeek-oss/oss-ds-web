import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test as base, expect } from "@playwright/test";

const exportDirectory = path.resolve("storybook-static");
const contentTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

export const test = base.extend({
  fixtureOrigin: [
    async ({}, use) => {
      const server = createServer(async (request, response) => {
        try {
          const pathname = new URL(request.url ?? "/", "http://localhost")
            .pathname;
          const file = path.resolve(
            exportDirectory,
            `.${decodeURIComponent(pathname)}`,
          );
          if (!file.startsWith(`${exportDirectory}${path.sep}`)) {
            response.writeHead(404).end();
            return;
          }
          const bytes = await readFile(file);
          response
            .writeHead(200, {
              "Content-Type":
                contentTypes[path.extname(file)] ?? "application/octet-stream",
            })
            .end(bytes);
        } catch (cause) {
          response.writeHead(cause.code === "ENOENT" ? 404 : 500).end();
        }
      });
      await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
      });
      try {
        const address = server.address();
        assert.ok(address && typeof address !== "string");
        await use(`http://127.0.0.1:${address.port}`);
      } finally {
        await new Promise((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve())),
        );
      }
    },
    { scope: "worker" },
  ],
  fixtureUrl: async ({ fixtureOrigin, theme }, use) => {
    const { entries: index } = JSON.parse(
      await readFile(path.join(exportDirectory, "index.json"), "utf8"),
    );
    const entries = Object.values(index);
    await use((file, name) => {
      const title = file
        .replace(/^stories\//, "")
        .replace(/\.stories\.tsx$/, "");
      const entry = entries.find(
        (entry) =>
          entry.type === "story" &&
          entry.title === title &&
          entry.name === (name ?? "Master"),
      );
      assert.ok(
        entry,
        `Missing Storybook story: ${title} / ${name ?? "Master"}`,
      );
      const id = entry.id;
      return `${fixtureOrigin}/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`;
    });
  },
  touch: async ({ hasTouch }, use) => use(Boolean(hasTouch)),
  width: async ({ viewport }, use) => use(viewport.width),
  theme: async ({ colorScheme }, use) => use(colorScheme),
  page: async ({ page, theme }, use) => {
    const failures = [];
    page.on("pageerror", (cause) => failures.push(cause.message));
    await page.addInitScript(
      (mode) => globalThis.localStorage.setItem("avgeek-oss-ui-theme", mode),
      theme,
    );
    await use(page);
    expect(failures, "Fixtures must not produce browser exceptions").toEqual(
      [],
    );
  },
});

// A react-aria grid takes focus back to its row once running CSS transitions
// end when a control inside a cell was focused with element.focus(), so a key
// pressed after locator.focus() can land on the row. Reach a row action the
// way a keyboard user does instead: the row, arrow keys to the action's cell,
// then Tab into the action.
export async function focusRowAction(page, action) {
  const cell = action.locator('xpath=ancestor::*[@role="gridcell"][1]');
  await action.evaluate((element) => element.closest('[role="row"]').focus());
  for (let step = 0; ; step += 1) {
    if (
      await cell.evaluate(
        (element) => element === globalThis.document.activeElement,
      )
    )
      break;
    assert.ok(step < 12, "Arrow keys must reach the row action's cell");
    await page.keyboard.press("ArrowRight");
  }
  await page.keyboard.press("Tab");
  await expect(action).toBeFocused();
}

// Waits until no CSS transition runs, which is when a grid applies a deferred
// focus move, and then two frames for focus restoration to answer it.
export async function settleFocus(page) {
  await page.evaluate(async () => {
    await Promise.all(
      globalThis.document
        .getAnimations()
        .filter((animation) => animation instanceof globalThis.CSSTransition)
        .map((animation) => animation.finished.catch(() => {})),
    );
    for (let frame = 0; frame < 2; frame += 1)
      await new Promise((resolve) => globalThis.requestAnimationFrame(resolve));
  });
}

export { expect };
