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

test("sign-in clears completed passwords and cached-page credentials while retaining email", async ({
  page,
  fixtureUrl,
}) => {
  await page.goto(
    fixtureUrl("stories/Patterns/Auth/SignIn.stories.tsx", "Credential retry"),
  );
  const email = page.getByRole("textbox", { name: /^Email/ });
  const password = page.getByLabel("Password", { exact: true });
  await email.fill("alex@example.test");
  await password.fill("preview password");
  await password.press("Enter");
  await expect(page.locator('[data-slot="toast"]')).toHaveCount(1);
  await expect(password).toHaveValue("");
  await expect(email).toHaveValue("alex@example.test");
  await password.fill("another password");
  await page.evaluate(() => globalThis.dispatchEvent(new Event("pagehide")));
  await expect(password).toHaveValue("");
  await expect(email).toHaveValue("alex@example.test");
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
    await dialog.getByRole("button", { name: /Permissions/ }).click();
    await page.getByRole("option", { name: "Read-only", exact: true }).click();
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

test("invitation entry focuses email and moves focus to the returned link action", async ({
  page,
  fixtureUrl,
  theme,
}, testInfo) => {
  await page.bringToFront();
  await page.goto(
    fixtureUrl("stories/Patterns/Team Settings/InviteMemberDialog.stories.tsx"),
  );
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  const opener = page.getByRole("button", {
    name: "Create invitation",
    exact: true,
  });
  await opener.click();
  const dialog = page.getByRole("dialog");
  const email = dialog.getByRole("textbox", { name: /^Email/ });
  await expect(email).toBeFocused();
  await email.fill("alex@example.test");
  await dialog
    .getByRole("button", { name: "Create invitation", exact: true })
    .click();
  const done = dialog.getByRole("button", { name: "Done", exact: true });
  await expect(done).toBeFocused();
  await expect(dialog).toContainText("https://example.test/invite/demo");
  await page.screenshot({ path: testInfo.outputPath("invitation-link.png") });
  await done.click();
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});

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

test("sign-in verification navigation uses the shared request and private acknowledgment", async ({
  page,
  fixtureUrl,
  touch,
  theme,
}, testInfo) => {
  await page.goto(
    fixtureUrl(
      "stories/Patterns/Auth/SignIn.stories.tsx",
      "Email verification recovery",
    ),
  );
  await page.bringToFront();
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  const verification = page.getByRole("button", {
    name: "Need a new verification email?",
    exact: true,
  });
  await expect(verification).toHaveCount(0);
  await page.getByRole("textbox", { name: /^Email/ }).fill("alex@example.test");
  await page
    .getByLabel("Password", { exact: false })
    .first()
    .fill("preview password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(verification).toBeVisible();
  const position = await verification.evaluate((element) => {
    const action = element.getBoundingClientRect();
    const content = element.parentElement.getBoundingClientRect();
    return Math.abs(
      action.x + action.width / 2 - content.x - content.width / 2,
    );
  });
  expect(position).toBeLessThan(1);
  await page.locator('[data-slot="toast-close"]').click();
  if (touch) await verification.tap();
  else {
    await verification.focus();
    await page.keyboard.press("Enter");
  }
  await expect(
    page.getByRole("heading", { name: "Verify your email", exact: true }),
  ).toBeVisible();
  const email = page.getByRole("textbox", { name: /^Email/ });
  await expect(email).not.toBeFocused();
  await email.fill("alex@example.test");
  await page.screenshot({
    path: testInfo.outputPath("verification-email.png"),
  });
  if (touch)
    await page
      .getByRole("button", { name: "Send verification link", exact: true })
      .tap();
  else await email.press("Enter");
  await expect(page.locator("form")).toHaveCount(0);
  await expect(
    page.getByText(
      "If an account needs email verification, we’ll send a link. Check your inbox and spam folder.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.locator(":focus")).toContainText("Verify your email");
  await page
    .getByRole("button", { name: "Request another link", exact: true })
    .click();
  await expect(page.getByRole("textbox", { name: /^Email/ })).toHaveValue(
    "alex@example.test",
  );
  await page
    .getByRole("button", { name: "← Back to Sign In", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Sign in", exact: true }),
  ).toBeVisible();
});

for (const contract of [
  {
    variant: "Verify email",
    title: "Verify your email",
    action: "Confirm email",
    success: "Email verified",
  },
  {
    variant: "Change email",
    title: "Confirm email change",
    action: "Confirm email change",
    success: "Email updated",
  },
  {
    variant: "Retry",
    title: "Verify your email",
    action: "Retry confirmation",
    success: "Email verified",
  },
]) {
  test(`email ${contract.variant} awaits explicit confirmation and retries with toast-only feedback`, async ({
    page,
    fixtureUrl,
    touch,
    theme,
  }, testInfo) => {
    await page.goto(
      fixtureUrl(
        "stories/Patterns/Auth/EmailConfirmation.stories.tsx",
        contract.variant === "Verify email" ? "Master" : contract.variant,
      ),
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const content = page.locator('[data-slot="identity-auth-content"]');
    const action = page.getByRole("button", {
      name: contract.action,
      exact: true,
    });
    const back = page.getByRole("button", {
      name: "← Back to Sign In",
      exact: true,
    });
    await expect(page.locator("[data-confirm-requests]")).toHaveText(
      "Requests: 0",
    );
    await action.focus();
    await page.keyboard.press("Enter");
    await expect(action).toBeDisabled();
    await action.press("Enter");
    await back.evaluate((element) => element.click());
    await expect(page.locator("[data-confirm-requests]")).toHaveText(
      "Requests: 1",
    );
    await expect(page.locator("[data-back-count]")).toHaveText("Back: 0");
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
    const complete = page.getByRole("button", {
      name: "Complete request",
      exact: true,
    });
    if (touch) await complete.tap();
    else await complete.click();
    const toast = page.locator('[data-slot="toast"]:not([data-exiting])');
    await expect(toast).toHaveCount(1);
    await expect(toast).toContainText("Confirmation failed. Try again.");
    await expect(content).not.toContainText("Confirmation failed");
    await expect(content.getByRole("alert")).toHaveCount(0);
    await expect(action).toBeEnabled();
    await expect(back).toBeEnabled();
    await toast.locator('[data-slot="toast-close"]').click();
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
    if (touch) await action.tap();
    else await action.click();
    await expect(page.locator("[data-confirm-requests]")).toHaveText(
      "Requests: 2",
    );
    if (touch) await complete.tap();
    else await complete.click();
    await expect(toast).toHaveCount(1);
    await expect(toast).toContainText(contract.success);
    await expect(content).toContainText("Sign in to continue.");
    await expect(content).not.toContainText(contract.success);
    await expect(action).toHaveCount(0);
    await expect(back).toBeEnabled();
    await expect(page.locator(":focus")).toContainText(contract.title);
    await expect(toast).toBeInViewport({ ratio: 1 });
    await page.screenshot({ path: testInfo.outputPath("preview.png") });
  });
}

test("email link states do not mutate on mount and omit unsupported retry", async ({
  page,
  fixtureUrl,
}) => {
  await page.goto(
    fixtureUrl(
      "stories/Patterns/Auth/EmailConfirmation.stories.tsx",
      "Missing link",
    ),
  );
  const content = page.locator('[data-slot="identity-auth-content"]');
  await expect(content.getByRole("button")).toHaveCount(1);
  await expect(content).toContainText("Return to sign in.");
  await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
  await expect(page.locator("[data-confirm-requests]")).toHaveText(
    "Requests: 0",
  );
  await page.goto(
    fixtureUrl(
      "stories/Patterns/Auth/EmailConfirmation.stories.tsx",
      "Checking",
    ),
  );
  await expect(content.getByRole("status")).toContainText(
    "Checking confirmation link…",
  );
  await expect(content.getByRole("button")).toBeDisabled();
  await expect(page.locator("[data-confirm-requests]")).toHaveText(
    "Requests: 0",
  );
  await page
    .getByRole("button", { name: "Finish checking", exact: true })
    .click();
  await expect(
    content.getByRole("button", { name: "Confirm email", exact: true }),
  ).toBeEnabled();
  await expect(page.locator("[data-confirm-requests]")).toHaveText(
    "Requests: 0",
  );
});

test("invitation resend awaits one request, retains name and code and honors cooldown", async ({
  page,
  fixtureUrl,
  touch,
}, testInfo) => {
  await page.goto(
    fixtureUrl(
      "stories/Patterns/Auth/InvitationVerification.stories.tsx",
      "Resend recovery",
    ),
  );
  const content = page.locator('[data-slot="identity-auth-content"]');
  const name = page.getByRole("textbox", { name: /^Your Name/ });
  const code = page.getByRole("textbox", { name: /^Email verification code/ });
  await name.fill("Alex");
  await code.fill("123456");
  const resend = page.getByRole("button", { name: "Resend code", exact: true });
  const complete = page.getByRole("button", {
    name: "Complete request",
    exact: true,
  });
  const toast = page.locator('[data-slot="toast"]:not([data-exiting])');
  for (let attempt = 1; attempt <= 2; attempt++) {
    await resend.evaluate((element) => {
      element.click();
      element.click();
    });
    await expect(resend).toBeDisabled();
    await expect(name).toBeDisabled();
    await content.locator("form").evaluate((form) => form.requestSubmit());
    await expect(page.locator("[data-resends]")).toHaveText(
      `Resends: ${attempt}`,
    );
    await expect(page.locator("[data-verifications]")).toHaveText(
      "Verifications: 0",
    );
    await expect(toast).toHaveCount(0);
    if (touch) await complete.tap();
    else await complete.click();
    await expect(toast).toHaveCount(1);
    await expect(toast).toContainText("Resend failed. Try again.");
    await expect(content).not.toContainText("Resend failed");
    await expect(name).toHaveValue("Alex");
    await expect(code).toHaveValue("123456");
    await expect(resend).toBeEnabled();
    await toast.locator('[data-slot="toast-close"]').click();
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
  }
  if (touch) await resend.tap();
  else {
    await resend.focus();
    await page.keyboard.press("Enter");
  }
  if (touch) await complete.tap();
  else await complete.click();
  await expect(toast).toHaveCount(1);
  await expect(toast).toContainText("Verification code requested.");
  await expect(content).not.toContainText("Verification code requested.");
  const cooldown = page.getByRole("button", { name: /^Resend in \d+s$/ });
  await expect(cooldown).toBeDisabled();
  await cooldown.evaluate((element) => element.click());
  await expect(page.locator("[data-resends]")).toHaveText("Resends: 3");
  await page.screenshot({ path: testInfo.outputPath("preview.png") });
  await toast.locator('[data-slot="toast-close"]').click();
  await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
  await page.getByRole("button", { name: "End cooldown", exact: true }).click();
  await expect(resend).toBeEnabled();
  await code.press("Enter");
  await expect(resend).toBeDisabled();
  await resend.evaluate((element) => element.click());
  await expect(page.locator("[data-resends]")).toHaveText("Resends: 3");
  await expect(page.locator("[data-verifications]")).toHaveText(
    "Verifications: 1",
  );
  if (touch) await complete.tap();
  else await complete.click();
  await expect(toast).toHaveCount(1);
  await expect(toast).toContainText("Verification failed. Try again.");
  await expect(content).not.toContainText("Verification failed");
  await expect(name).toHaveValue("Alex");
  await expect(code).toHaveValue("123456");
  await expect(resend).toBeEnabled();
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
    variant: "Passkey",
    opener: "Add passkey",
    field: /^Name/,
    draft: "Travel key",
    submit: "Continue",
    settlement: "resolve",
    result: "Passkey added",
  },
  {
    variant: "ApiKey",
    opener: "Create key",
    field: /^Name/,
    draft: "Automation",
    submit: "Create key",
    settlement: "reject",
    result: "preview-key",
  },
  {
    variant: "Invitation",
    opener: "Create invitation",
    field: /^Email/,
    draft: "alex@example.test",
    submit: "Create invitation",
    settlement: "resolve",
    result: "https://example.test/invite/preview",
  },
]) {
  test(`${scenario.variant} suspension releases native locks, retains drafts and ignores old settlements`, async ({
    page,
    fixtureUrl,
    theme,
  }, testInfo) => {
    await page.goto(
      fixtureUrl(
        suspensionFixture,
        scenario.variant === "Passkey" ? "Master" : scenario.variant,
      ),
    );
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
    if (scenario.variant === "ApiKey") {
      await dialog.getByRole("button", { name: /Permissions/ }).click();
      await page
        .getByRole("option", { name: "Read-only", exact: true })
        .click();
      await dialog.getByRole("button", { name: /Expires after/ }).click();
      await page.getByRole("option", { name: "Never", exact: true }).click();
    }
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
    if (scenario.variant === "Passkey") {
      await expect(dialog).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "Add passkey", exact: true }),
      ).toBeFocused();
      await expect(page.locator('[data-slot="toast"]')).toHaveCount(1);
      await expect(page.locator('[data-slot="toast"]')).toContainText(
        scenario.result,
      );
    } else {
      await expect(dialog).toContainText(scenario.result);
      await expect(
        dialog.getByRole("button", { name: "Done", exact: true }),
      ).toBeFocused();
    }
    await page.screenshot({ path: testInfo.outputPath("resumed-result.png") });
  });
}
for (const settlement of ["resolve", "reject"]) {
  test(`a new account ignores the old passkey ${settlement} without restoring its draft`, async ({
    page,
    fixtureUrl,
  }) => {
    await page.goto(fixtureUrl(suspensionFixture, "Master"));
    await page
      .getByRole("button", { name: "Add passkey", exact: true })
      .click();
    await page.getByRole("textbox", { name: /^Name/ }).fill("Old account key");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await previewEvent(page, "suspend");
    await page
      .getByRole("button", { name: "Switch account", exact: true })
      .click();
    await previewEvent(page, settlement);
    await page
      .getByRole("button", { name: "Add passkey", exact: true })
      .click();
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
    await page.goto(
      fixtureUrl(
        suspensionFixture,
        scenario.variant === "Passkey" ? "Master" : scenario.variant,
      ),
    );
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
    await page.goto(
      fixtureUrl(suspensionFixture, variant === "Passkey" ? "Master" : variant),
    );
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

for (const variant of ["PasskeyRename", "PasskeyRecovery"]) {
  test(`${variant} returns to its live management opener after a suspended fresh request`, async ({
    page,
    fixtureUrl,
  }) => {
    await page.goto(
      fixtureUrl(suspensionFixture, variant === "Passkey" ? "Master" : variant),
    );
    await page.bringToFront();
    const opener = page.getByRole("button", {
      name: variant === "PasskeyRename" ? "Rename" : "Add passkey",
      exact: true,
    });
    await opener.click();
    await page.getByRole("textbox", { name: /^Name/ }).fill("Travel key");
    const submit = page.getByRole("button", {
      name: variant === "PasskeyRename" ? "Update" : "Continue",
      exact: true,
    });
    await submit.click();
    await previewEvent(page, "suspend");
    await page
      .getByRole("button", { name: "Resume same account", exact: true })
      .click();
    await previewEvent(page, "reject");
    await expect(page.getByRole("textbox", { name: /^Name/ })).toHaveValue(
      "Travel key",
    );
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
    await submit.click();
    await expect(page.getByTestId("requests")).toHaveText("Requests: 2");
    await previewEvent(page, "resolve");
    if (variant === "PasskeyRecovery") {
      const dialog = page.getByRole("dialog");
      await expect(dialog).toContainText("Save recovery codes");
      await expect(dialog).toContainText("demo-0001-preview");
      await expect(page.locator('[data-slot="toast"]')).toHaveCount(1);
      await page
        .locator('[data-slot="toast"]')
        .getByRole("button", { name: "Close", exact: true })
        .click();
      await dialog
        .getByRole("button", { name: "Continue", exact: true })
        .click();
    } else
      await expect(
        page.getByRole("row").filter({ hasText: "Travel key" }),
      ).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(opener).toBeFocused();
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(
      variant === "PasskeyRecovery" ? 0 : 1,
    );
  });
}

const heldNameFixture =
  "stories/Patterns/Account Settings/ProfileSettings.stories.tsx";
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
  test(`profile save ${outcome} after suspension retains its draft without stale feedback and permits current failure retries`, async ({
    page,
    fixtureUrl,
  }) => {
    await page.goto(fixtureUrl(heldNameFixture, "Held save"));
    const name = page.getByRole("textbox", { name: /^Your Name/ });
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
    await expect(page.getByTestId("saved-name")).toHaveText("Saved name: Alex");
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
  test(`an unmounted profile save ${outcome} cannot notify or unlock a newer owner's held request`, async ({
    page,
    fixtureUrl,
  }) => {
    await page.goto(fixtureUrl(heldNameFixture, "Held save"));
    const name = page.getByRole("textbox", { name: /^Your Name/ });
    await name.fill("Previous owner");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByTestId("requests")).toHaveText("Requests: 1");
    await page
      .getByRole("button", { name: "Switch account", exact: true })
      .click();
    await expect(name).toHaveValue("Morgan");
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
      "Saved name: Morgan",
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

test("installation setup requires a secret and retains account drafts after a failed claim", async ({
  page,
  fixtureUrl,
}, testInfo) => {
  await page.bringToFront();
  await page.goto(
    fixtureUrl("stories/Patterns/Auth/TeamSetup.stories.tsx", "Secret retry"),
  );
  const secret = page.getByLabel("Installation setup secret", { exact: true });
  await page.getByLabel("Team name", { exact: true }).fill("Test team");
  await page.getByLabel("Your Name", { exact: true }).fill("Test admin");
  await page.getByLabel("Email", { exact: true }).fill("admin@example.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill("A secure test passphrase 42!");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(secret).toBeFocused();
  await secret.fill("disposable-installation-secret");
  await page.screenshot({
    path: testInfo.outputPath("installation-secret.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page
      .getByRole("heading", { name: "Set your preferences" })
      .locator("xpath=ancestor::div[@tabindex='-1']"),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Complete Setup", exact: true })
    .click();
  await expect(page.locator('[data-slot="toast"]').last()).toContainText(
    "The installation setup secret is incorrect",
  );
  await page.getByRole("button", { name: "← Back", exact: true }).click();
  await expect(secret).toHaveValue("disposable-installation-secret");
  await expect(page.getByLabel("Team name", { exact: true })).toHaveValue(
    "Test team",
  );
  await secret.fill("corrected-disposable-secret");
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
