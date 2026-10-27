import assert from "node:assert/strict";
import { test, expect } from "./fixtures.mjs";

async function press(control, touch) {
  if (touch) await control.tap();
  else await control.click();
}
test("sidebar links preserve navigation, active sections and mobile dismissal @new-tab", async ({
  page,
  context,
  fixtureUrl,
  touch,
  theme,
}, testInfo) => {
  await page.goto(fixtureUrl("stories/Layouts/SecondarySidebar.stories.tsx"));
  await page.bringToFront();
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  const toggle = page.getByRole("button", { name: "Toggle navigation" });
  if (touch) await press(toggle, touch);
  const preferences = page.getByRole("link", {
    name: "Preferences",
    exact: true,
  });
  await expect(preferences).toHaveAttribute("href", "/preferences");
  const box = await preferences.boundingBox();
  assert.ok(
    box && box.height >= 36,
    "Secondary links retain native menu height",
  );
  await expect(
    page.getByRole("link", { name: "Profile", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.getByRole("button", { name: "Restricted", exact: true }),
  ).toBeDisabled();
  if (!touch) {
    const newTabPromise = context.waitForEvent("page");
    await preferences.click({ modifiers: ["ControlOrMeta"] });
    const newTab = await newTabPromise;
    await newTab.waitForLoadState();
    await newTab.close();
    await page.bringToFront();
    await expect(page.locator("[data-route]")).toHaveText("/profile");
  }
  await preferences.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-route]")).toHaveText("/preferences");
  await expect(page.locator("[data-actions]")).toHaveText("Actions: 0");
  if (touch) {
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(toggle).toBeFocused();
    await press(toggle, touch);
  }
  await page.screenshot({
    path: testInfo.outputPath("preview.png"),
    animations: "disabled",
  });
  await press(
    page.getByRole("button", { name: "Refresh account", exact: true }),
    touch,
  );
  await expect(page.locator("[data-actions]")).toHaveText("Actions: 1");
  if (touch) await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.goto(
    fixtureUrl("stories/Layouts/Shell.stories.tsx", "Account settings"),
  );
  if (touch)
    await press(page.getByRole("button", { name: "Toggle navigation" }), touch);
  const account = page
    .getByRole("navigation", { name: "Primary navigation", exact: true })
    .getByRole("link", {
      name: "Account settings",
      exact: true,
    });
  await expect(account).toHaveAttribute("aria-current", "page");
  const team = page
    .getByRole("navigation", { name: "Primary navigation", exact: true })
    .getByRole("link", {
      name: "Team settings",
      exact: true,
    });
  await expect(team).not.toHaveAttribute("aria-current", "page");
  if (touch) await page.keyboard.press("Escape");
  await page.goto(
    fixtureUrl("stories/Layouts/Shell.stories.tsx", "Team settings"),
  );
  if (touch)
    await press(page.getByRole("button", { name: "Toggle navigation" }), touch);
  await expect(
    page
      .getByRole("navigation", {
        name: "Primary navigation",
        exact: true,
      })
      .getByRole("link", { name: "Team settings", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page
      .getByRole("navigation", {
        name: "Primary navigation",
        exact: true,
      })
      .getByRole("link", { name: "Account settings", exact: true }),
  ).not.toHaveAttribute("aria-current", "page");
});
test("notification activation waits, retries and preserves native modified clicks @new-tab", async ({
  page,
  context,
  fixtureUrl,
  touch,
}, testInfo) => {
  await page.bringToFront();
  await page.goto(
    fixtureUrl(
      "stories/Patterns/NotificationMenu.stories.tsx",
      "Activation and recovery",
    ),
  );
  const trigger = page.getByRole("button", { name: /^Notifications/ });
  await press(trigger, touch);
  await expect(page.locator("[data-activation-count]")).toHaveText(
    "Activations: 0",
  );
  const task = page.getByRole("link", { name: /Deployment completed/ });
  if (!touch) {
    const newTabPromise = context.waitForEvent("page");
    await task.click({ modifiers: ["ControlOrMeta"] });
    const newTab = await newTabPromise;
    await newTab.waitForLoadState();
    await newTab.close();
    await page.bringToFront();
    await expect(page.locator("[data-activation-count]")).toHaveText(
      "Activations: 0",
    );
    await expect(page.getByRole("dialog")).toBeVisible();
  }
  await task.focus();
  await page.keyboard.press("Enter");
  await expect(task).toHaveAttribute("aria-busy", "true");
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-activation-count]")).toHaveText(
    "Activations: 1",
  );
  await expect(page.locator("[data-navigation]")).toHaveText("Not navigated");
  await press(
    page.getByRole("button", {
      name: "Complete activation",
      exact: true,
    }),
    touch,
  );
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(task).toHaveAttribute("aria-busy", "false");
  await expect(page.locator('[data-slot="toast"]')).toHaveCount(1);
  await expect(page.getByRole("dialog")).not.toContainText("Could not mark");
  await press(
    page.getByRole("button", { name: "Load more", exact: true }),
    touch,
  );
  await expect(
    page.getByRole("link", { name: /Health check failed/ }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("preview.png"),
    animations: "disabled",
  });
  await press(task, touch);
  await expect(page.locator("[data-activation-count]")).toHaveText(
    "Activations: 2",
  );
  await expect(page.locator("[data-navigation]")).toHaveText("Not navigated");
  await press(
    page.getByRole("button", {
      name: "Complete activation",
      exact: true,
    }),
    touch,
  );
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator("[data-navigation]")).toHaveText(
    "Navigated to #deployment",
  );
  await press(trigger, touch);
  await press(
    page.getByRole("button", { name: "Mark all as read", exact: true }),
    touch,
  );
  await expect(
    page.getByRole("button", { name: "Marking read…", exact: true }),
  ).toBeDisabled();
  await press(
    page.getByRole("button", { name: "Complete mark all", exact: true }),
    touch,
  );
  await expect(
    page.getByRole("button", { name: "Mark all as read", exact: true }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await press(
    page.getByRole("button", {
      name: "Simulate query failure",
      exact: true,
    }),
    touch,
  );
  await press(trigger, touch);
  await expect(page.getByRole("dialog")).not.toContainText(
    "No notifications yet",
  );
  await expect(page.getByRole("dialog")).not.toContainText("Could not load");
  await press(
    page.getByRole("button", {
      name: "Retry notifications",
      exact: true,
    }),
    touch,
  );
  await expect(task).toBeVisible();
});

for (const variant of ["Ignored activation", "Ignored async activation"]) {
  test(`notification ${variant} stays open without feedback and permits later navigation`, async ({
    page,
    fixtureUrl,
    touch,
  }) => {
    await page.goto(
      fixtureUrl(
        "stories/Patterns/NotificationMenu.stories.tsx",
        variant === "Mark all read" ? "Master" : variant,
      ),
    );
    const trigger = page.getByRole("button", { name: /^Notifications/ });
    await press(trigger, touch);
    const task = page.getByRole("link", { name: /Deployment completed/ });
    await task.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-ignored-attempts]")).toHaveText(
      "Attempts: 1",
    );
    await expect(task).toHaveAttribute("aria-busy", "false");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(task).toBeFocused();
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
    await expect(page.locator("[data-navigation]")).toHaveText("Not navigated");
    await press(task, touch);
    await expect(page.locator("[data-ignored-attempts]")).toHaveText(
      "Attempts: 2",
    );
    await expect(task).toHaveAttribute("aria-busy", "false");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
    await press(
      page.getByRole("button", { name: "Allow activation", exact: true }),
      touch,
    );
    await press(task, touch);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(page.locator("[data-ignored-attempts]")).toHaveText(
      "Attempts: 3",
    );
    await expect(page.locator("[data-navigation]")).toHaveText(
      "Navigated to #deployment",
    );
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
  });
}

for (const variant of [
  "Master",
  "Replaced navbar",
  "Destination focus",
  "Destination heading",
]) {
  test(`browser Back restores navigation focus with ${variant}`, async ({
    page,
    fixtureUrl,
    touch,
    reducedMotion,
  }) => {
    test.skip(
      !touch && variant !== "Destination heading",
      "This regression concerns the mobile drawer",
    );
    await page.goto(
      fixtureUrl(
        "stories/Layouts/NavigationFocus.stories.tsx",
        variant === "Stable navbar" ? "Master" : variant,
      ),
    );
    await page.bringToFront();
    if (!touch) {
      const heading = page.getByRole("heading", { name: "Task", exact: true });
      const toggle = page.getByRole("button", {
        name: "Toggle navigation",
        exact: true,
      });
      await expect(heading).toHaveAttribute(
        "data-navigation-restoring",
        "false",
      );
      await toggle.click();
      await expect(heading).toHaveAttribute(
        "data-navigation-restoring",
        "false",
      );
      await page.keyboard.press("Space");
      await expect(heading).toHaveAttribute(
        "data-navigation-restoring",
        "false",
      );
      await expect(page.getByRole("dialog")).toHaveCount(0);
      return;
    }
    await page.addStyleTag({
      content:
        ".drawer__dialog {--drawer-exit-duration: 600ms !important;} .drawer__backdrop[data-exiting] {transition-duration:600ms !important;}",
    });
    for (let repeat = 0; repeat < 6; repeat++) {
      await page
        .getByRole("button", { name: "Back to board", exact: true })
        .tap();
      await expect(
        page.getByRole("heading", { name: "Board", exact: true }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Toggle navigation", exact: true })
        .tap();
      await expect(
        page.getByRole("dialog", { name: "Navigation" }),
      ).toBeVisible();
      await page.evaluate(async () => {
        await Promise.all(
          globalThis.document
            .getAnimations()
            .map((animation) => animation.finished),
        );
      });
      const outgoing = await page
        .getByRole("dialog", { name: "Navigation" })
        .textContent();
      await page.goBack();
      if (reducedMotion !== "reduce") {
        await expect(
          page.locator(".drawer__backdrop[data-exiting=true]"),
        ).toBeVisible();
        await expect(
          page.getByRole("dialog", { name: "Navigation" }),
        ).toHaveText(outgoing);
        await expect(
          page.getByRole("heading", { name: "Board", exact: true }),
        ).toHaveAttribute("data-navigation-restoring", "true");
      }
      await expect(
        page.getByRole("dialog", { name: "Navigation" }),
      ).toHaveCount(0);
      const expected =
        variant === "Destination focus"
          ? "Destination action"
          : "Toggle navigation";
      await expect(
        page.getByRole("button", { name: expected, exact: true }),
      ).toBeFocused();
      await expect(
        page.getByRole("heading", { name: "Task", exact: true }),
      ).toHaveAttribute("data-navigation-restoring", "false");
    }
  });
}

test("a drawer reopened as the destination mounts keeps focus inside navigation", async ({
  page,
  fixtureUrl,
  touch,
}) => {
  test.skip(!touch, "This regression concerns the mobile drawer");
  await page.goto(
    fixtureUrl(
      "stories/Layouts/NavigationFocus.stories.tsx",
      "Reopen on arrival",
    ),
  );
  await page.bringToFront();
  await page.getByRole("button", { name: "Back to board", exact: true }).tap();
  const toggle = page.getByRole("button", {
    name: "Toggle navigation",
    exact: true,
  });
  await toggle.tap();
  await expect(page.getByRole("dialog", { name: "Navigation" })).toBeVisible();
  await page.evaluate(async () => {
    await Promise.all(
      globalThis.document
        .getAnimations()
        .map((animation) => animation.finished),
    );
  });
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Task", exact: true }),
  ).toBeAttached();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("heading", { name: "Task", exact: true }),
  ).toHaveAttribute("data-navigation-restoring", "false");
  const navigation = page.getByRole("dialog", { name: "Navigation" });
  await expect(navigation).toBeVisible();
  await expect(
    navigation.getByRole("button", { name: "All status", exact: true }),
  ).toHaveCount(0);
  await expect
    .poll(() =>
      navigation.evaluate((element) =>
        element.contains(globalThis.document.activeElement),
      ),
    )
    .toBe(true);
  await page.keyboard.press("Escape");
  await expect(navigation).toHaveCount(0);
  await expect(toggle).toBeFocused();
});

async function sampleFrames(popover) {
  const frames = await popover.evaluate(async (element) => {
    const frames = [];
    for (let index = 0; index < 12; index++) {
      const bounds = element.getBoundingClientRect();
      const style = globalThis.getComputedStyle(element);
      frames.push({
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        identity: new globalThis.DOMMatrixReadOnly(style.transform).isIdentity,
        opacity: Number(style.opacity),
      });
      await new Promise(globalThis.requestAnimationFrame);
    }
    return frames;
  });
  for (const [index, frame] of frames.entries()) {
    assert.equal(
      frame.identity,
      true,
      "Breadcrumb popover must not scale or slide",
    );
    for (const property of ["x", "y", "width", "height"])
      assert.ok(
        Math.abs(frame[property] - frames[0][property]) < 0.2,
        "Breadcrumb geometry must remain steady",
      );
    if (index > 0)
      assert.ok(
        frame.opacity + 0.001 >= frames[index - 1].opacity,
        "Opening opacity must progress without flickering",
      );
  }
  assert.equal(frames.at(-1).opacity, 1);
}

for (const kind of ["dropdown", "select"]) {
  test(`breadcrumb ${kind} preserves geometry, selection and focus through interrupted motion`, async ({
    page,
    fixtureUrl,
    touch,
    theme,
    reducedMotion,
  }, testInfo) => {
    await page.goto(
      fixtureUrl(
        "stories/Primitives/Navigation/Breadcrumbs.stories.tsx",
        "Sidebar categories omitted",
      ),
    );
    await page.bringToFront();
    await page.evaluate(() => globalThis.document.fonts.ready);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const categoryTrails = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(
      categoryTrails.getByText("Stats", { exact: true }),
    ).toHaveCount(0);
    const dailyTrail = categoryTrails.filter({ hasText: "Daily View" });
    await expect(dailyTrail.locator("li")).toHaveCount(1);
    await expect(dailyTrail.locator('[aria-current="page"]')).toHaveText(
      "Daily View",
    );
    await expect(dailyTrail.getByText("/", { exact: true })).toHaveCount(0);
    await page.goto(
      fixtureUrl(
        "stories/Primitives/Navigation/Breadcrumbs.stories.tsx",
        kind === "dropdown" ? "Dropdown" : "Searchable dropdown",
      ),
    );
    const trigger = page.getByRole("button", {
      name: kind === "dropdown" ? "Switch section" : /Switch item/,
      exact: kind === "dropdown",
    });
    const popover = page.locator(
      kind === "dropdown"
        ? '[data-slot="dropdown-popover"]'
        : '[data-slot="select-popover"]',
    );
    const trails = page.getByRole("navigation", { name: "Breadcrumb" });
    for (const trail of await trails.all()) {
      const items = trail.locator("li");
      await expect(trail.locator('[aria-current="page"]')).toHaveCount(1);
      const emphasis = await items.evaluateAll((items) =>
        items.map((item) => {
          const label = item.lastElementChild;
          const style = globalThis.getComputedStyle(
            label.querySelector("button") ?? label,
          );
          return { color: style.color, weight: style.fontWeight };
        }),
      );
      const current = emphasis.at(-1);
      assert.equal(current.weight, "500");
      for (const parent of emphasis.slice(0, -1)) {
        assert.equal(parent.weight, "400");
        assert.notEqual(parent.color, current.color);
      }
    }
    const triggerColor = await trigger.evaluate(
      (element) => globalThis.getComputedStyle(element).color,
    );
    await press(trigger, touch);
    await sampleFrames(popover);
    assert.equal(
      await trigger.evaluate(
        (element) => globalThis.getComputedStyle(element).color,
      ),
      triggerColor,
      "Opening a breadcrumb menu retains its hierarchy emphasis",
    );
    if (reducedMotion === "reduce")
      assert.equal(
        await popover.evaluate(
          (element) =>
            element
              .getAnimations()
              .filter((animation) => animation.playState === "running").length,
        ),
        0,
      );
    await page.keyboard.press("Escape");
    await expect(popover).toHaveCount(0);
    await expect(trigger).toBeFocused();
    for (let attempt = 0; attempt < 3; attempt++) {
      await trigger.focus();
      await page.keyboard.press("Enter");
      await expect(popover).toHaveCount(1);
      await page.keyboard.press("Escape");
      const bounds = await trigger.boundingBox();
      assert.ok(bounds);
      if (touch)
        await page.touchscreen.tap(
          bounds.x + bounds.width / 2,
          bounds.y + bounds.height / 2,
        );
      else
        await page.mouse.click(
          bounds.x + bounds.width / 2,
          bounds.y + bounds.height / 2,
        );
      await expect(popover).toHaveCount(1);
      await expect(popover).not.toHaveAttribute("data-exiting", "true");
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await expect
        .poll(() =>
          popover.evaluate((element) =>
            element.contains(globalThis.document.activeElement),
          ),
        )
        .toBe(true);
      await page.keyboard.press("Escape");
      await expect(popover).toHaveCount(0);
      await expect(trigger).toBeFocused();
    }
    if (reducedMotion === "no-preference") {
      const slowExit = await page.addStyleTag({
        content:
          ".breadcrumb-popover[data-exiting=true] { transition-duration: 10s !important; }",
      });
      await press(trigger, touch);
      await sampleFrames(popover);
      await page.keyboard.press("Escape");
      assert.equal(
        await popover.evaluate((element) => {
          const animation = element
            .getAnimations()
            .find((animation) => animation.playState === "running");
          if (!animation) return false;
          element.dataset.reopenMarker = "same-popover";
          animation.pause();
          return true;
        }),
        true,
        "Paused exit fixture must retain the mounted popover",
      );
      const bounds = await trigger.boundingBox();
      assert.ok(bounds);
      if (touch)
        await page.touchscreen.tap(
          bounds.x + bounds.width / 2,
          bounds.y + bounds.height / 2,
        );
      else
        await page.mouse.click(
          bounds.x + bounds.width / 2,
          bounds.y + bounds.height / 2,
        );
      await expect(popover).not.toHaveAttribute("data-exiting", "true");
      await expect(popover).toHaveAttribute(
        "data-reopen-marker",
        "same-popover",
      );
      await expect
        .poll(() =>
          popover.evaluate((element) =>
            element.contains(globalThis.document.activeElement),
          ),
        )
        .toBe(true);
      await slowExit.evaluate((element) => element.remove());
      await page.keyboard.press("Escape");
      await expect(popover).toHaveCount(0);
      await expect(trigger).toBeFocused();
    }
    const slowEntry =
      reducedMotion === "no-preference"
        ? await page.addStyleTag({
            content:
              ".breadcrumb-popover:not([data-exiting=true]) { transition-duration: 10s !important; }",
          })
        : null;
    await press(trigger, touch);
    if (slowEntry)
      assert.equal(
        await popover.evaluate((element) => {
          const animation = element
            .getAnimations()
            .find((animation) => animation.playState === "running");
          if (!animation) return false;
          animation.pause();
          return true;
        }),
        true,
        "Opening fade must be active for the interrupted selection test",
      );
    if (kind === "select") {
      const search = page.getByRole("searchbox", {
        name: "Search items",
      });
      await search.fill("Second");
      await expect(
        page.getByRole("option", { name: "First item", exact: true }),
      ).toHaveCount(0);
    }
    const item = page.getByRole(
      kind === "dropdown" ? "menuitemradio" : "option",
      {
        name: kind === "dropdown" ? "Second section" : "Second item",
        exact: true,
      },
    );
    if (!touch) {
      const bounds = await item.boundingBox();
      assert.ok(bounds);
      await page.mouse.move(
        bounds.x + bounds.width / 2,
        bounds.y + bounds.height / 2,
      );
      await page.mouse.down();
      assert.equal(
        await item.evaluate(
          (element) =>
            new globalThis.DOMMatrixReadOnly(
              globalThis.getComputedStyle(element).transform,
            ).isIdentity,
        ),
        true,
        "Pressed breadcrumb items must not scale",
      );
      await page.mouse.up();
    } else await item.tap();
    await expect(popover).toHaveCount(0);
    if (slowEntry) await slowEntry.evaluate((element) => element.remove());
    await expect(trigger).toContainText(
      kind === "dropdown" ? "Second section" : "Second item",
    );
    await press(trigger, touch);
    await sampleFrames(popover);
    await page.screenshot({
      path: testInfo.outputPath("preview.png"),
    });
    await page.keyboard.press("Escape");
    await expect(popover).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
}

test("notification dialog ref preserves focus through disabled refresh and pagination", async ({
  page,
  fixtureUrl,
  touch,
  theme,
}, testInfo) => {
  await page.goto(
    fixtureUrl(
      "stories/Patterns/NotificationMenu.stories.tsx",
      "Focus management",
    ),
  );
  await page.bringToFront();
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  const trigger = page.getByRole("button", { name: /^Notifications/ });
  await press(trigger, touch);
  const dialog = page.getByRole("dialog");
  const original = await dialog.elementHandle();
  assert.ok(original);
  const row = page.getByRole("link", { name: /Deployment completed/ });
  await expect(row).toContainText("Unread");
  const complete = async () =>
    page
      .getByRole("button", { name: "Complete request", exact: true })
      .evaluate((element) => element.click());
  for (const [index, name] of ["Refresh", "Load more"].entries()) {
    const action = dialog.getByRole("button", { name, exact: true });
    await action.focus();
    await page.keyboard.press("Enter");
    await expect(action).toBeDisabled();
    await expect(dialog).toBeFocused();
    await expect(page.locator("[data-focus-requests]")).toHaveText(
      `Requests: ${index + 1}`,
    );
    await complete();
    await expect(action).toBeEnabled();
    await expect(action).toBeFocused();
    assert.equal(
      await original.evaluate(
        (element) =>
          element.isConnected &&
          element === globalThis.document.querySelector('[role="dialog"]'),
      ),
      true,
    );
  }
  await expect(row).toContainText("Read");
  const refresh = dialog.getByRole("button", { name: "Refresh", exact: true });
  await refresh.focus();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeFocused();
  await row.focus();
  await complete();
  await expect(refresh).toBeEnabled();
  await expect(row).toBeFocused();
  // Pointer activation does not grant ownership of keyboard focus.
  await press(
    dialog.getByRole("button", { name: "Load more", exact: true }),
    touch,
  );
  await row.focus();
  await complete();
  await expect(row).toBeFocused();
  await page.screenshot({
    path: testInfo.outputPath("notification-focus.png"),
    animations: "disabled",
  });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("a notification completed after close and reopen leaves the current menu alone", async ({
  page,
  fixtureUrl,
  touch,
}) => {
  await page.goto(
    fixtureUrl(
      "stories/Patterns/NotificationMenu.stories.tsx",
      "Activation and recovery",
    ),
  );
  await page.bringToFront();
  const trigger = page.getByRole("button", { name: /^Notifications/ });
  await press(trigger, touch);
  const task = page.getByRole("link", { name: /Deployment completed/ });
  await task.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-activation-count]")).toHaveText(
    "Activations: 1",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await press(trigger, touch);
  const complete = page.getByRole("button", {
    name: "Complete activation",
    exact: true,
  });
  await task.focus();
  await complete.evaluate((element) => element.click());
  await expect(page.locator("[data-navigation]")).toHaveText("Not navigated");
  await expect(task).toHaveAttribute("aria-busy", "false");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
  await expect(task).toBeFocused();
});

test("notification trigger keeps its geometry during held pointer, keyboard and touch presses", async ({
  page,
  fixtureUrl,
  touch,
  theme,
}) => {
  await page.goto(
    fixtureUrl("stories/Patterns/NotificationMenu.stories.tsx", "Master"),
  );
  await page.bringToFront();
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  const trigger = page.getByRole("button", { name: /^Notifications/ });
  const rest = await trigger.boundingBox();
  assert.ok(rest);
  async function assertSteady(pressed = true) {
    if (pressed) await expect(trigger).toHaveAttribute("data-pressed", "true");
    else await expect(trigger).not.toHaveAttribute("data-pressed", "true");
    const samples = await trigger.evaluate(async (element) => {
      const frames = [];
      for (let i = 0; i < 12; i++) {
        const bounds = element.getBoundingClientRect();
        frames.push({
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          identity: new globalThis.DOMMatrixReadOnly(
            globalThis.getComputedStyle(element).transform,
          ).isIdentity,
        });
        await new Promise(globalThis.requestAnimationFrame);
      }
      return frames;
    });
    for (const frame of samples) {
      assert.equal(frame.identity, true, "Notification presses must not scale");
      for (const key of ["x", "y", "width", "height"])
        assert.ok(
          Math.abs(frame[key] - rest[key]) < 0.2,
          `Held press must preserve ${key}`,
        );
    }
  }
  async function dismiss() {
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await assertSteady(false);
  }
  await assertSteady(false);
  await page.mouse.move(rest.x + rest.width / 2, rest.y + rest.height / 2);
  await page.mouse.down();
  await assertSteady();
  await page.mouse.up();
  await dismiss();
  await trigger.focus();
  await page.keyboard.down("Space");
  await assertSteady();
  await page.keyboard.up("Space");
  await dismiss();
  if (touch) {
    const session = await page.context().newCDPSession(page);
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [
        { x: rest.x + rest.width / 2, y: rest.y + rest.height / 2 },
      ],
    });
    await assertSteady();
    await session.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await session.detach();
    await dismiss();
  }
  const auxiliary = page.getByRole("button", {
    name: "Restore notifications",
    exact: true,
  });
  await auxiliary.focus();
  await page.keyboard.down("Space");
  await expect(auxiliary).toHaveAttribute("data-pressed", "true");
  assert.equal(
    await auxiliary.evaluate(async (element) => {
      for (let i = 0; i < 12; i++)
        await new Promise(globalThis.requestAnimationFrame);
      return new globalThis.DOMMatrixReadOnly(
        globalThis.getComputedStyle(element).transform,
      ).isIdentity;
    }),
    false,
    "Other native buttons retain their press behavior",
  );
  await page.keyboard.up("Space");
});
