import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AuthForm } from "../../dist/patterns/auth/auth-form.js";
import { test, expect } from "./fixtures.mjs";

test("auth form native submission keeps credentials out of the URL before JavaScript handles events", async ({
  page,
  fixtureOrigin,
}) => {
  const destination = `${fixtureOrigin}/native-form`;
  const markup = renderToStaticMarkup(
    createElement(AuthForm, {
      fields: [
        { name: "email", label: "Email", type: "email", required: true },
        {
          name: "password",
          label: "Password",
          type: "password",
          required: true,
        },
      ],
      submitLabel: "Continue",
      onSubmit: async () => {
        throw new Error("The static form has no JavaScript handlers");
      },
    }),
  );
  const submissions = [];
  await page.route(destination, async (route) => {
    const request = route.request();
    if (request.method() === "POST") {
      submissions.push({
        url: request.url(),
        body: request.postData(),
      });
      await route.fulfill({
        contentType: "text/html",
        body: "<h1>Request received</h1>",
      });
    } else {
      await route.fulfill({ contentType: "text/html", body: markup });
    }
  });
  await page.goto(destination);
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("alex@example.test");
  await page.getByLabel("Password", { exact: true }).fill("private passphrase");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Request received" }),
  ).toBeVisible();
  expect(submissions).toHaveLength(1);
  expect(submissions[0].url).toBe(destination);
  const body = new URLSearchParams(submissions[0].body);
  expect(body.get("email")).toBe("alex@example.test");
  expect(body.get("password")).toBe("private passphrase");
});

test("sign-in shows the redirect error, has no credential fields and starts the provider sign-in once", async ({
  page,
  fixtureUrl,
}) => {
  await page.goto(
    fixtureUrl("stories/Patterns/Auth/SignIn.stories.tsx", "Redirect error"),
  );
  await expect(
    page.getByText(
      "Confirming needs multi-factor authentication in authentik",
      { exact: false },
    ),
  ).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveCount(0);
  const start = page.getByRole("button", {
    name: "Continue with authentik",
    exact: true,
  });
  await start.click();
  await expect(page.locator('[data-slot="toast"]')).toHaveCount(1);
  await expect(page.locator('[data-slot="toast"]')).toContainText(
    "Preview: continue to authentik",
  );
  await expect(
    page.getByRole("button", { name: /Redirecting/ }),
  ).toBeDisabled();
  await page.evaluate(() =>
    globalThis.dispatchEvent(
      new globalThis.PageTransitionEvent("pageshow", { persisted: true }),
    ),
  );
  await expect(start).toBeEnabled();
});

for (const variant of ["Name validation"]) {
  test(`API key ${variant.toLowerCase()} keeps invalid drafts and allows one trimmed submission`, async ({
    page,
    fixtureUrl,
    touch,
    theme,
  }, testInfo) => {
    await page.bringToFront();
    await page.goto(
      fixtureUrl(
        "stories/Patterns/Account Settings/CreateApiKeyDialog.stories.tsx",
        variant === "Name validation" ? "Master" : variant,
      ),
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.getByRole("button", { name: "Create key", exact: true }).click();
    const dialog = page.locator('[data-slot="modal-dialog"]');
    const name = dialog.getByRole("textbox", { name: /^Name/ });
    const createButton = dialog.getByRole("button", {
      name: "Create key",
      exact: true,
    });
    await name.fill("Automation");
    await expect(createButton).toBeDisabled();
    await dialog.getByRole("button", { name: /Role/ }).click();
    await expect(page.getByRole("option", { name: /^Admin/ })).toBeVisible();
    await page.getByRole("option", { name: /^Viewer/ }).click();
    await expect(createButton).toBeDisabled();
    await dialog.getByRole("button", { name: /Expires after/ }).click();
    for (const option of ["30 days", "90 days", "1 year", "Never"])
      await expect(
        page.getByRole("option", { name: option, exact: true }),
      ).toBeVisible();
    await page.getByRole("option", { name: "90 days", exact: true }).click();
    await expect(createButton).toBeEnabled();
    await name.fill("   ");
    for (let attempt = 0; attempt < 2; attempt++) {
      if (touch)
        await dialog
          .getByRole("button", { name: "Create key", exact: true })
          .tap();
      else await name.press("Enter");
      await expect(page.getByTestId("create-requests")).toHaveText(
        "Create requests: 0",
      );
      await expect(name).toBeFocused();
      await expect(name).toHaveValue("   ");
      await expect(dialog).not.toContainText("Enter a name for this API key.");
      const toast = page.locator(
        '[data-slot="toast"]:not([data-exiting=true])',
      );
      await expect(toast).toHaveCount(1);
      await expect(toast).toContainText("Enter a name for this API key.");
      await toast.locator('[data-slot="toast-close"]').click();
      await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
      await expect(name).toBeFocused();
    }
    await page.screenshot({
      path: testInfo.outputPath("preview.png"),
    });
    await name.fill(" Automation ");
    const create = dialog.getByRole("button", {
      name: "Create key",
      exact: true,
    });
    await create.evaluate((element) => {
      element.click();
      element.click();
    });
    await expect(page.getByTestId("create-requests")).toHaveText(
      "Create requests: 1",
    );
    await expect(page.getByTestId("submitted-name")).toHaveText(
      "Submitted name: Automation",
    );
    await expect(dialog).toContainText("preview-key");
    await dialog.getByRole("button", { name: "Done", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Create key", exact: true }),
    ).toBeFocused();
  });
}

test("auth page composition retains the same gutters as a standalone auth screen", async ({
  page,
  fixtureUrl,
  width,
}) => {
  const frames = [];
  for (const variant of ["Master", "Page layout"]) {
    await page.goto(
      fixtureUrl(
        "stories/Patterns/Auth/SignIn.stories.tsx",
        variant === "Default" ? "Master" : variant,
      ),
    );
    await expect(
      page.getByRole("heading", { name: "Sign in", exact: true }),
    ).toBeVisible();
    frames.push(
      await page
        .locator('[data-slot="identity-auth-content"]')
        .evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return {
            left: bounds.left,
            top: bounds.top,
            width: bounds.width,
            overflow:
              element.ownerDocument.documentElement.scrollWidth >
              element.ownerDocument.defaultView.innerWidth,
          };
        }),
    );
  }
  expect(frames[1]).toEqual(frames[0]);
  expect(frames[1].overflow).toBe(false);
  if (width < 640) {
    expect(frames[1].left).toBe(16);
    expect(frames[1].top).toBe(32);
  }
});

const suspensionFixture =
  "stories/Primitives/Overlays/OverlaySuspensionScope.stories.tsx";
async function previewEvent(page, type) {
  await page.evaluate(
    (name) => globalThis.dispatchEvent(new Event(`preview:${name}`)),
    type,
  );
}
for (const scenario of [
  {
    variant: "ApiKey",
    opener: "Create key",
    field: /^Name/,
    draft: "Automation",
    submit: "Create key",
    settlement: "reject",
    result: "preview-key",
  },
]) {
  test(`${scenario.variant} suspension releases native locks, retains drafts and ignores old settlements`, async ({
    page,
    fixtureUrl,
    theme,
  }, testInfo) => {
    await page.goto(fixtureUrl(suspensionFixture, scenario.variant));
    await page.bringToFront();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const originalOverflow = await page.evaluate(
      () => globalThis.document.documentElement.style.overflow,
    );
    await page
      .getByRole("button", { name: scenario.opener, exact: true })
      .click();
    let dialog = page.getByRole("dialog");
    await dialog
      .getByRole("textbox", { name: scenario.field })
      .fill(scenario.draft);
    await dialog.getByRole("button", { name: /Role/ }).click();
    await page.getByRole("option", { name: /^Viewer/ }).click();
    await dialog.getByRole("button", { name: /Expires after/ }).click();
    await page.getByRole("option", { name: "Never", exact: true }).click();
    await dialog
      .getByRole("button", { name: scenario.submit, exact: true })
      .click();
    await expect(page.getByTestId("requests")).toHaveText("Requests: 1");
    await previewEvent(page, "suspend");
    await expect(page.locator('[data-slot="modal-backdrop"]')).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(() => globalThis.document.documentElement.style.overflow),
      )
      .toBe(originalOverflow);
    const resume = page.getByRole("button", {
      name: "Resume same account",
      exact: true,
    });
    await expect(resume).toBeVisible();
    expect(
      await resume.evaluate((node) => Boolean(node.closest("[inert]"))),
    ).toBe(false);
    await page.screenshot({ path: testInfo.outputPath("suspended.png") });
    await resume.click();
    dialog = page.getByRole("dialog");
    const field = dialog.getByRole("textbox", { name: scenario.field });
    await expect(field).toHaveValue(scenario.draft);
    await expect(field).toBeDisabled();
    await previewEvent(page, scenario.settlement);
    await expect(field).toBeEnabled();
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
    await expect(field).toHaveValue(scenario.draft);
    await dialog
      .getByRole("button", { name: scenario.submit, exact: true })
      .click();
    await expect(page.getByTestId("requests")).toHaveText("Requests: 2");
    await previewEvent(page, "reject");
    const toast = page.locator('[data-slot="toast"]');
    await expect(toast).toHaveCount(1);
    await expect(toast).toContainText("Request rejected");
    await expect(field).toHaveValue(scenario.draft);
    await toast.locator('[data-slot="toast-close"]').click();
    await expect(toast).toHaveCount(0);
    await dialog
      .getByRole("button", { name: scenario.submit, exact: true })
      .click();
    await expect(page.getByTestId("requests")).toHaveText("Requests: 3");
    await previewEvent(page, "resolve");
    await expect(dialog).toContainText(scenario.result);
    await expect(
      dialog.getByRole("button", { name: "Done", exact: true }),
    ).toBeFocused();
    await page.screenshot({ path: testInfo.outputPath("resumed-result.png") });
  });
}
for (const settlement of ["resolve", "reject"]) {
  test(`a new account ignores the old key request's ${settlement} without restoring its draft`, async ({
    page,
    fixtureUrl,
  }) => {
    await page.goto(fixtureUrl(suspensionFixture, "Master"));
    await page.getByRole("button", { name: "Create key", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog
      .getByRole("textbox", { name: /^Name/ })
      .fill("Old account key");
    await dialog.getByRole("button", { name: /Role/ }).click();
    await page.getByRole("option", { name: /^Viewer/ }).click();
    await dialog.getByRole("button", { name: /Expires after/ }).click();
    await page.getByRole("option", { name: "Never", exact: true }).click();
    await dialog
      .getByRole("button", { name: "Create key", exact: true })
      .click();
    await previewEvent(page, "suspend");
    await page
      .getByRole("button", { name: "Switch account", exact: true })
      .click();
    await previewEvent(page, settlement);
    await page.getByRole("button", { name: "Create key", exact: true }).click();
    await expect(page.getByRole("textbox", { name: /^Name/ })).toHaveValue("");
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
  });
}
for (const scenario of [
  { variant: "Modal", opener: "Open overlay", role: "dialog" },
  {
    variant: "AlertDialog",
    opener: "Open overlay",
    role: "alertdialog",
    dismissal: "keyboard",
  },
  {
    variant: "AlertDialog",
    opener: "Open overlay",
    role: "alertdialog",
    dismissal: "pointer",
  },
  { variant: "Dropdown", opener: "Open dropdown", role: "menu" },
  { variant: "Popover", opener: "Open popover", role: "dialog" },
  { variant: "Confirmation", opener: "Revoke access", role: "dialog" },
]) {
  test(`${scenario.variant}${scenario.dismissal ? ` ${scenario.dismissal}` : ""} suspension preserves logical open state and releases the native portal`, async ({
    page,
    fixtureUrl,
  }) => {
    await page.goto(fixtureUrl(suspensionFixture, scenario.variant));
    await page.bringToFront();
    const originalOverflow = await page.evaluate(
      () => globalThis.document.documentElement.style.overflow,
    );
    await page
      .getByRole("button", { name: scenario.opener, exact: true })
      .click();
    await expect(page.getByRole(scenario.role)).toBeVisible();
    if (["Modal", "AlertDialog"].includes(scenario.variant)) {
      await page
        .getByRole("textbox", { name: "Name", exact: true })
        .fill("Retained draft");
      await expect(page.getByTestId("logical-open")).toHaveText("Open: true");
    }
    await previewEvent(page, "suspend");
    await expect(page.getByRole(scenario.role)).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(() => globalThis.document.documentElement.style.overflow),
      )
      .toBe(originalOverflow);
    await page
      .getByRole("button", { name: "Resume same account", exact: true })
      .click();
    await expect(page.getByRole(scenario.role)).toBeVisible();
    if (["Modal", "AlertDialog"].includes(scenario.variant)) {
      await expect(
        page.getByRole("textbox", { name: "Name", exact: true }),
      ).toHaveValue("Retained draft");
      await expect(page.getByTestId("logical-open")).toHaveText("Open: true");
      await page.keyboard.press("Escape");
      if (scenario.variant === "AlertDialog") {
        await expect(page.getByRole(scenario.role)).toBeVisible();
        const close = page.getByRole("button", { name: "Close", exact: true });
        if (scenario.dismissal === "pointer") await close.click();
        else {
          await close.focus();
          await page.keyboard.press("Enter");
        }
      }
    } else if (["Dropdown", "Popover"].includes(scenario.variant)) {
      await page.keyboard.press("Escape");
    }
    if (
      ["Modal", "AlertDialog", "Dropdown", "Popover"].includes(scenario.variant)
    ) {
      await expect(page.getByRole(scenario.role)).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: scenario.opener, exact: true }),
      ).toBeFocused();
    }
  });
}

for (const variant of ["AlertRerender", "AlertDestination"]) {
  test(`${variant} close recovery respects committed rerenders and deliberate destination focus`, async ({
    page,
    fixtureUrl,
  }) => {
    await page.goto(fixtureUrl(suspensionFixture, variant));
    await page.bringToFront();
    await page
      .getByRole("button", { name: "Open overlay", exact: true })
      .click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await previewEvent(page, "suspend");
    await page
      .getByRole("button", { name: "Resume same account", exact: true })
      .click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
    if (variant === "AlertRerender")
      await expect(page.getByTestId("revision")).toHaveText("Revision: 1");
    await expect(
      page.getByRole("button", {
        name:
          variant === "AlertDestination" ? "Destination focus" : "Open overlay",
        exact: true,
      }),
    ).toBeFocused();
  });
}
for (const name of ["Date format", "Time format", "Time zone"]) {
  test(`retained preferences ${name.toLowerCase()} releases its native picker during suspension`, async ({
    page,
    fixtureUrl,
  }) => {
    await page.goto(fixtureUrl(suspensionFixture, "Preferences"));
    await page.bringToFront();
    const opener = page.getByRole("button", { name: new RegExp(name) });
    await opener.click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await previewEvent(page, "suspend");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect(page.locator('[data-slot="select-popover"]')).toHaveCount(0);
    await page
      .getByRole("button", { name: "Resume same account", exact: true })
      .click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect(opener).toBeFocused();
  });
}

const heldNameFixture =
  "stories/Patterns/Team Settings/TeamGeneralSettings.stories.tsx";
async function settleNameSave(page, request, outcome) {
  await page.evaluate(
    ({ request, outcome }) =>
      globalThis.window.dispatchEvent(
        new CustomEvent(`preview:name-${outcome}`, { detail: request }),
      ),
    { request, outcome },
  );
}
async function repeatNameSubmit(page) {
  await page.evaluate(() => {
    const form = globalThis.document.querySelector("form");
    if (!(form instanceof globalThis.HTMLFormElement))
      throw new Error("Missing name form");
    form.requestSubmit();
    form.requestSubmit();
  });
}
async function dismissNameToast(page) {
  const toast = page.locator('[data-slot="toast"]');
  await expect(toast).toHaveCount(1);
  await toast.getByRole("button", { name: "Close", exact: true }).click();
  await expect(toast).toHaveCount(0);
}
for (const outcome of ["resolve", "reject"]) {
  test(`team name save ${outcome} after suspension retains its draft without stale feedback and permits current failure retries`, async ({
    page,
    fixtureUrl,
  }) => {
    await page.goto(fixtureUrl(heldNameFixture, "Held save"));
    const name = page.getByRole("textbox", { name: /^Team name/ });
    await name.fill("Travel profile");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await repeatNameSubmit(page);
    await expect(page.getByTestId("requests")).toHaveText("Requests: 1");
    await page
      .getByRole("button", { name: "Suspend account", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Resume same account", exact: true })
      .click();
    await expect(name).toHaveValue("Travel profile");
    await expect(name).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Saving…", exact: true }),
    ).toBeDisabled();
    await settleNameSave(page, 1, outcome);
    await expect(name).toBeEnabled();
    await expect(name).toHaveValue("Travel profile");
    await expect(page.getByTestId("saved-name")).toHaveText(
      "Saved name: Avgeek",
    );
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
    for (const request of [2, 3]) {
      await page.getByRole("button", { name: "Save", exact: true }).click();
      await repeatNameSubmit(page);
      await expect(page.getByTestId("requests")).toHaveText(
        `Requests: ${request}`,
      );
      await settleNameSave(page, request, "reject");
      await expect(page.locator('[data-slot="toast"]')).toHaveText(
        /Name save rejected/,
      );
      await expect(name).toHaveValue("Travel profile");
      await expect(name).toBeEnabled();
      await dismissNameToast(page);
    }
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByTestId("requests")).toHaveText("Requests: 4");
    await settleNameSave(page, 4, "resolve");
    await expect(page.getByTestId("saved-name")).toHaveText(
      "Saved name: Travel profile",
    );
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(1);
    await expect(page.locator('[data-slot="toast"]')).toHaveText(
      /Changes saved/,
    );
    await expect(name).toBeEnabled();
    await expect(
      page.getByRole("button", { name: "Save", exact: true }),
    ).toBeDisabled();
  });
  test(`an unmounted team name save ${outcome} cannot notify or unlock a newer owner's held request`, async ({
    page,
    fixtureUrl,
  }) => {
    await page.goto(fixtureUrl(heldNameFixture, "Held save"));
    const name = page.getByRole("textbox", { name: /^Team name/ });
    await name.fill("Previous owner");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByTestId("requests")).toHaveText("Requests: 1");
    await page
      .getByRole("button", { name: "Switch account", exact: true })
      .click();
    await expect(name).toHaveValue("Northwind");
    await name.fill("Current owner");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByTestId("requests")).toHaveText("Requests: 2");
    await settleNameSave(page, 1, outcome);
    await expect(name).toHaveValue("Current owner");
    await expect(name).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Saving…", exact: true }),
    ).toBeDisabled();
    await expect(page.getByTestId("saved-name")).toHaveText(
      "Saved name: Northwind",
    );
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
    await repeatNameSubmit(page);
    await expect(page.getByTestId("requests")).toHaveText("Requests: 2");
    await settleNameSave(page, 2, "reject");
    await expect(name).toHaveValue("Current owner");
    await expect(name).toBeEnabled();
    await expect(page.locator('[data-slot="toast"]')).toHaveText(
      /Name save rejected/,
    );
    await dismissNameToast(page);
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByTestId("requests")).toHaveText("Requests: 3");
    await settleNameSave(page, 3, "resolve");
    await expect(page.getByTestId("saved-name")).toHaveText(
      "Saved name: Current owner",
    );
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(1);
    await expect(page.locator('[data-slot="toast"]')).toHaveText(
      /Changes saved/,
    );
  });
}

test("time-zone results scroll independently and focus uses a background", async ({
  page,
  fixtureUrl,
}) => {
  await page.goto(
    fixtureUrl(
      "stories/Patterns/Account Settings/PreferencesSettings.stories.tsx",
      "All time zones",
    ),
  );
  await page.getByRole("button", { name: /Time zone/ }).click();
  const list = page.getByRole("listbox");
  await expect(list).toBeVisible();
  const search = page.getByRole("searchbox", { name: "Search time zones" });
  await expect(search).toBeVisible();
  const scroll = await list.evaluate((element) => {
    const before = element.scrollTop;
    element.scrollTop = element.scrollHeight;
    return {
      before,
      after: element.scrollTop,
      overflow: globalThis.getComputedStyle(element).overflowY,
    };
  });
  expect(scroll.after).toBeGreaterThan(scroll.before);
  expect(scroll.overflow).toBe("auto");
  const layers = await search.evaluate((element) => {
    const field = element.closest(".search-field").getBoundingClientRect();
    const list = element
      .closest(".select__popover")
      .querySelector('[role="listbox"]')
      .getBoundingClientRect();
    const point = globalThis.document.elementFromPoint(
      field.x + field.width / 2,
      field.y + field.height / 2,
    );
    return {
      listTop: list.top,
      searchBottom: field.bottom,
      searchOnTop: !!point?.closest(".search-field"),
    };
  });
  expect(layers.listTop).toBeGreaterThanOrEqual(layers.searchBottom - 1);
  expect(layers.searchOnTop).toBe(true);

  await search.fill("Africa");
  await search.press("ArrowDown");
  const focused = list.locator('[data-focused="true"]');
  await expect(focused).toHaveCount(1);
  await expect(focused).toHaveCSS("outline-style", "none");
  await expect(focused).toHaveCSS("box-shadow", "none");
  await focused.click();
  await expect(list).toHaveCount(0);
});

test("choice field search filters options, avoids iOS input zoom and selects the match", async ({
  page,
  fixtureUrl,
  width,
}) => {
  await page.goto(
    fixtureUrl("stories/Patterns/ChoiceField.stories.tsx", "Search"),
  );
  const trigger = page.getByRole("button", { name: /Assignee/ });
  await expect(trigger).toContainText("Unassigned");
  await trigger.click();
  const search = page.getByRole("searchbox", { name: "Search assignee" });
  await expect(search).toBeVisible();
  // iOS zooms into inputs with text under 16px.
  await expect(search).toHaveCSS("font-size", width < 640 ? "16px" : "14px");
  await search.fill("pri");
  const list = page.getByRole("listbox");
  await expect(list.getByRole("option")).toHaveCount(1);
  await list.getByRole("option", { name: "Priya Raman" }).click();
  await expect(list).toHaveCount(0);
  await expect(trigger).toContainText("Priya Raman");
});

test("team setup collects only the team name, then retains it after a failed completion", async ({
  page,
  fixtureUrl,
}, testInfo) => {
  await page.bringToFront();
  await page.goto(
    fixtureUrl("stories/Patterns/Auth/TeamSetup.stories.tsx", "Retry"),
  );
  await expect(page.getByRole("textbox")).toHaveCount(1);
  await expect(page.getByLabel(/password|email|secret/i)).toHaveCount(0);
  const team = page.getByLabel("Team name", { exact: true });
  await team.fill("Test team");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page
      .getByRole("heading", { name: "Set your preferences" })
      .locator("xpath=ancestor::div[@tabindex='-1']"),
  ).toBeFocused();
  await page.screenshot({
    path: testInfo.outputPath("team-setup.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Complete Setup", exact: true })
    .click();
  await expect(page.locator('[data-slot="toast"]').last()).toContainText(
    "Could not save the team. Try again.",
  );
  await page.getByRole("button", { name: "← Back", exact: true }).click();
  await expect(team).toHaveValue("Test team");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Complete Setup", exact: true })
    .click();
  await expect(page.locator('[data-slot="toast"]').last()).toContainText(
    "Setup completed for Test team",
  );
});

test("file upload supports keyboard selection, pending locks and failed-file retry without overflow", async ({
  page,
  fixtureUrl,
  theme,
}, testInfo) => {
  await page.goto(
    fixtureUrl("stories/Patterns/FileUpload.stories.tsx", "Failure and retry"),
  );
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  const upload = page.getByRole("button", {
    name: "Upload attachment",
    exact: true,
  });
  const initialWidth = (await upload.boundingBox()).width;
  await upload.focus();
  const chooserPromise = page.waitForEvent("filechooser");
  await upload.press("Enter");
  const chooser = await chooserPromise;
  const fileName = "a-long-attachment-name-for-responsive-layout-review.png";
  await chooser.setFiles({
    name: fileName,
    mimeType: "image/png",
    buffer: Buffer.from("fixture image"),
  });
  const pendingUpload = page.getByRole("button", {
    name: "Uploading…",
    exact: true,
  });
  await expect(pendingUpload).toBeDisabled();
  await expect
    .poll(async () => (await pendingUpload.boundingBox()).width)
    .toBeCloseTo(initialWidth, 1);
  await expect(
    page.getByRole("status").filter({ hasText: fileName }),
  ).toBeVisible();
  await expect(
    page
      .locator('[data-slot="toast"]')
      .filter({ hasText: "The upload failed. Try again." }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Retry upload", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Choose another file", exact: true }),
  ).toBeEnabled();
  await expect(page.getByRole("list", { name: "Uploaded files" })).toHaveCount(
    0,
  );
  await page.screenshot({ path: testInfo.outputPath("file-upload-retry.png") });
  expect(
    await page.evaluate(
      () =>
        globalThis.document.documentElement.scrollWidth <=
        globalThis.innerWidth,
    ),
  ).toBe(true);
  const retry = page.getByRole("button", { name: "Retry upload", exact: true });
  const retryWidth = (await retry.boundingBox()).width;
  await retry.click();
  await expect(pendingUpload).toBeDisabled();
  expect((await pendingUpload.boundingBox()).width).toBeCloseTo(retryWidth, 1);
  await expect(page.getByRole("list", { name: "Uploaded files" })).toHaveText(
    fileName,
  );
  await expect(upload).toBeEnabled();
  await expect(
    page.getByRole("status").filter({ hasText: fileName }),
  ).toHaveCount(0);
});

test("initial dropped file starts without a picker, retains failed retry and uploads once", async ({
  page,
  fixtureUrl,
}) => {
  await page.goto(
    fixtureUrl(
      "stories/Patterns/FileUpload.stories.tsx",
      "Initial dropped file",
    ),
  );
  await expect(
    page.getByRole("button", { name: "Uploading…", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("status").filter({ hasText: "dropped-diagram.png" }),
  ).toBeVisible();
  await expect(
    page
      .locator('[data-slot="toast"]')
      .filter({ hasText: "The upload failed. Try again." }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Retry upload", exact: true }).click();
  await expect(page.getByRole("list", { name: "Uploaded files" })).toHaveText(
    "dropped-diagram.png",
  );
  await expect(
    page.getByRole("button", { name: "Upload attachment", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("list", { name: "Uploaded files" }).getByRole("listitem"),
  ).toHaveCount(1);
  await expect(
    page.getByRole("status").filter({ hasText: "dropped-diagram.png" }),
  ).toHaveCount(0);
});
