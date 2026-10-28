import "./dom-environment.js";
import assert from "node:assert/strict";
import test, { afterEach, beforeEach, mock } from "node:test";
import { act, StrictMode, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { OperationProgress } from "../src/patterns/operations/operation-progress.js";
import { AuthForm } from "../src/patterns/auth/auth-form.js";
import { EmailChangeSettings } from "../src/patterns/account-settings/email-change-settings.js";
import { AsyncActionButton } from "../src/patterns/actions/async-action-button.js";
import { ActionConfirmation } from "../src/patterns/actions/action-confirmation.js";
import { PasswordChangeSettings } from "../src/patterns/account-settings/password-change-settings.js";
import { CreateApiKeyDialog } from "../src/patterns/account-settings/create-api-key-dialog.js";
import { InviteMemberDialog } from "../src/patterns/team-settings/invite-member-dialog.js";
import { NotificationDestinationsSettings } from "../src/patterns/notification-settings/notification-destinations-settings.js";
import { FilterDialog } from "../src/patterns/filters/filter-dialog.js";
import { toast } from "../src/overlays/toast.js";
import { IdentityCredentialsForm } from "../src/patterns/auth/identity-credentials-form.js";
import { McpAuthorization } from "../src/patterns/auth/mcp-authorization.js";

import { NameSettingsForm } from "../src/patterns/settings/name-form.js";
import { EmailConfirmation } from "../src/patterns/auth/email-confirmation.js";
import { InvitationVerification } from "../src/patterns/auth/invitation-verification.js";
import { VerificationEmail } from "../src/patterns/auth/verification-email.js";
import { SignIn } from "../src/patterns/auth/sign-in.js";
import { InvitationPasswordSetup } from "../src/patterns/auth/invitation-password-setup.js";
import { PasskeyRecoveryVerification } from "../src/patterns/auth/passkey-recovery-verification.js";
import { PasskeyVerification } from "../src/patterns/auth/passkey-verification.js";
import { ConfirmIdentityDialog } from "../src/patterns/auth/confirm-identity-dialog.js";
import { PasskeySettings } from "../src/patterns/account-settings/passkey-settings.js";
import { MemberEditDialog } from "../src/patterns/team-settings/member-edit-dialog.js";
import { TeamGeneralSettings } from "../src/patterns/team-settings/team-general-settings.js";
import { MembersTable } from "../src/patterns/team-settings/members-table.js";
import { InvitationsTable } from "../src/patterns/team-settings/invitations-table.js";
import { RecoveryCodes } from "../src/patterns/auth/recovery-codes.js";
import { CodeBlock } from "../src/typography/code-block.js";

import { ResourceTable } from "../src/patterns/resource-table.js";
import { FileUpload } from "../src/patterns/file-upload.js";
import { QueryLoading } from "../src/patterns/feedback/query-state.js";

let dangerMessages: ReactNode[] = [];
beforeEach(() => {
  dangerMessages = [];
  mock.method(toast, "danger", (message: ReactNode) => {
    dangerMessages.push(message);
    return "preview-toast";
  });
});
afterEach(() => mock.restoreAll());

async function mount(content: ReactNode) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(content);
  });
  return {
    container,
    async render(content: ReactNode) {
      await act(async () => root.render(content));
    },
    async unmount() {
      await act(async () => root.unmount());
      container.remove();
    },
  };
}
function assertFailureToast(message: string) {
  assert.deepEqual(dangerMessages, [message]);
  assert.doesNotMatch(document.body.textContent ?? "", new RegExp(message));
}
function button(label: string) {
  const found = [...document.querySelectorAll("button")].find(
    (item) => item.textContent?.trim() === label,
  );
  assert.ok(found, `Missing button: ${label}`);
  return found;
}
async function click(element: Element) {
  await act(async () => {
    element.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
  });
}
async function fill(name: string, value: string) {
  const input = document.querySelector<HTMLInputElement>(
    `input[name="${name}"]`,
  );
  assert.ok(input, `Missing input: ${name}`);
  await act(async () => {
    // oxlint-disable-next-line typescript/unbound-method -- the native value setter is called with .call(element, value)
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    assert.ok(setter);
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function chooseKeyOption(label: string) {
  const select = [...document.querySelectorAll("select")].find((element) =>
    [...element.options].some((option) => option.textContent === label),
  );
  assert.ok(select, `Missing selection option: ${label}`);
  const option = [...select.options].find((item) => item.textContent === label);
  assert.ok(option);
  await act(async () => {
    select.value = option.value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
async function submit() {
  const form = document.querySelector("form");
  assert.ok(form);
  await act(async () => {
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
  });
}
function deferred() {
  let resolve: () => void = () => {
    throw new Error("Promise not initialized");
  };
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

test("async actions lock repeated presses, surface rejection, and allow retry", async () => {
  let calls = 0;
  const pending = deferred();
  const view = await mount(
    <AsyncActionButton
      onAction={async () => {
        calls++;
        if (calls === 1) {
          await pending.promise;
          throw new Error("Save failed");
        }
      }}
    >
      Save
    </AsyncActionButton>,
  );
  try {
    await click(button("Save"));
    await click(button("Please wait…"));
    assert.equal(calls, 1);
    await act(async () => pending.resolve());
    assertFailureToast("Save failed");
    await click(button("Save"));
    assert.equal(calls, 2);
    assert.equal(document.querySelector('[role="alert"]'), null);
  } finally {
    await view.unmount();
  }
});

test("confirmation stays open during requests and after failure, then closes on success", async () => {
  let calls = 0;
  const pending = deferred();
  function Example() {
    const [isOpen, setOpen] = useState(true);
    return (
      <ActionConfirmation
        isOpen={isOpen}
        onOpenChange={setOpen}
        title="Remove member?"
        description="Their access will be removed."
        confirmLabel="Remove"
        onConfirm={async () => {
          calls++;
          if (calls === 1) {
            await pending.promise;
            throw new Error("Removal failed");
          }
        }}
      />
    );
  }
  const view = await mount(<Example />);
  try {
    await click(button("Remove"));
    assert.equal(button("Cancel").disabled, true);
    await click(button("Cancel"));
    assert.ok(document.querySelector('[role="dialog"]'));
    await act(async () => pending.resolve());
    assertFailureToast("Removal failed");
    assert.ok(document.querySelector('[role="dialog"]'));
    await click(button("Remove"));
    assert.equal(document.querySelector('[role="dialog"]'), null);
  } finally {
    await view.unmount();
  }
});

test("password mismatch never reaches the callback and successful changes clear credentials", async () => {
  let calls = 0;
  const view = await mount(
    <PasswordChangeSettings
      requireCurrentPassword={false}
      onChangePassword={async (values) => {
        calls++;
        assert.equal(values.newPassword, "a long secure password");
        assert.equal(values.currentPassword, undefined);
      }}
    />,
  );
  try {
    await fill("newPassword", "a long secure password");
    await fill("confirmPassword", "another long password");
    await submit();
    assert.equal(calls, 0);
    await fill("confirmPassword", "a long secure password");
    await submit();
    assert.equal(calls, 1);
    assert.equal(
      document.querySelector<HTMLInputElement>('input[name="newPassword"]')
        ?.value,
      "",
    );
  } finally {
    await view.unmount();
  }
});

test("API key creation retains the name on failure and removes the revealed secret on close", async () => {
  let calls = 0;
  function Example() {
    const [isOpen, setOpen] = useState(true);
    return (
      <CreateApiKeyDialog
        isOpen={isOpen}
        onOpenChange={setOpen}
        permissionOptions={[{ id: "read", label: "Read-only" }]}
        expiryOptions={[{ id: "90", label: "90 days" }]}
        onCreate={async (values) => {
          calls++;
          assert.equal(values.permission.toUpperCase(), "READ");
          assert.deepEqual(values, {
            name: "Automation",
            permission: "read",
            expiry: "90",
          });
          if (calls === 1) throw new Error("Creation failed");
          return { token: "preview-secret" };
        }}
      />
    );
  }
  const view = await mount(<Example />);
  try {
    await fill("name", "Automation");
    await chooseKeyOption("Read-only");
    await chooseKeyOption("90 days");
    await submit();
    assertFailureToast("Creation failed");
    assert.equal(
      document.querySelector<HTMLInputElement>('input[name="name"]')?.value,
      "Automation",
    );
    await submit();
    assert.match(document.body.textContent ?? "", /preview-secret/);
    assert.equal(document.activeElement?.textContent, "Done");
    await click(button("Done"));
    assert.doesNotMatch(document.body.textContent ?? "", /preview-secret/);
  } finally {
    await view.unmount();
  }
});

test("invitation link appears only after success and failed invitations retain the email", async () => {
  let calls = 0;
  const view = await mount(
    <InviteMemberDialog
      isOpen
      onOpenChange={() => {}}
      roles={[{ id: "member", label: "Member" }]}
      resultGuidance={<p>Email delivery is not configured.</p>}
      onInvite={async (values) => {
        calls++;
        assert.deepEqual(values, { email: "sam@example.test", role: "member" });
        if (calls === 1) throw new Error("Invitation failed");
        return { inviteUrl: "https://example.test/invite/new" };
      }}
    />,
  );
  try {
    await fill("email", "sam@example.test");
    await submit();
    assertFailureToast("Invitation failed");
    assert.doesNotMatch(document.body.textContent ?? "", /Invitation created/);
    assert.equal(
      document.querySelector<HTMLInputElement>('input[name="email"]')?.value,
      "sam@example.test",
    );
    await submit();
    assert.match(
      document.body.textContent ?? "",
      /Share this private invitation link/,
    );
    assert.match(
      document.body.textContent ?? "",
      /https:\/\/example.test\/invite\/new/,
    );
  } finally {
    await view.unmount();
  }
});

test("subscription failure leaves controlled choices unchanged", async () => {
  let calls = 0;
  const view = await mount(
    <NotificationDestinationsSettings
      items={[
        {
          id: "email",
          label: "alex@example.test",
          subscriptions: { incidents: "off" },
        },
      ]}
      categories={[
        { id: "incidents", label: "Incidents", modes: ["off", "all"] },
      ]}
      onSubscriptionChange={async (_item, category, mode) => {
        calls++;
        assert.equal(category, "incidents");
        assert.equal(mode, "all");
        throw new Error("Subscription failed");
      }}
    />,
  );
  try {
    const checkbox = document.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    );
    assert.ok(checkbox, document.body.innerHTML);
    await click(checkbox);
    assert.equal(calls, 1);
    assert.equal(checkbox.checked, false);
    assertFailureToast("Subscription failed");
  } finally {
    await view.unmount();
  }
});

test("filter drafts cancel without committing, and empty field definitions cannot open", async () => {
  let calls = 0;
  const view = await mount(
    <FilterDialog
      fields={[
        {
          field: "path",
          label: "Path",
          operators: [{ value: "contains", label: "Contains" }],
        },
      ]}
      value={[]}
      onChange={() => {
        calls++;
      }}
    />,
  );
  try {
    await click(button("Filters"));
    assert.ok(document.querySelector('[role="dialog"]'));
    await click(button("Cancel"));
    assert.equal(calls, 0);
  } finally {
    await view.unmount();
  }
  const empty = await mount(
    <FilterDialog
      fields={[]}
      value={[]}
      onChange={() => {
        calls++;
      }}
    />,
  );
  try {
    assert.equal(button("Filters").disabled, true);
  } finally {
    await empty.unmount();
  }
});

test("form submissions in the same frame invoke the mutation once", async () => {
  let calls = 0;
  const pending = deferred();
  const view = await mount(
    <AuthForm
      fields={[{ name: "name", label: "Name", required: true }]}
      submitLabel="Save"
      onSubmit={async () => {
        calls++;
        await pending.promise;
      }}
    />,
  );
  try {
    await fill("name", "Alex");
    const form = document.querySelector("form");
    assert.ok(form);
    await act(async () => {
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });
    assert.equal(calls, 1);
    await act(async () => pending.resolve());
  } finally {
    await view.unmount();
  }
});

test("form rejection keeps the draft and reports one toast without inline duplication", async () => {
  const view = await mount(
    <AuthForm
      fields={[{ name: "name", label: "Name", required: true }]}
      submitLabel="Save"
      onSubmit={async () => {
        throw new Error("Could not save your name");
      }}
    />,
  );
  try {
    await fill("name", "Alex");
    await submit();
    assertFailureToast("Could not save your name");
    assert.equal(
      document.querySelector<HTMLInputElement>('input[name="name"]')?.value,
      "Alex",
    );
    assert.equal(button("Save").disabled, false);
  } finally {
    await view.unmount();
  }
});

test("credential submission errors use toasts even with inline field validation", async () => {
  const view = await mount(
    <IdentityCredentialsForm
      errorPresentation="inline"
      onSubmit={async () => {
        throw new Error("Sign in request failed");
      }}
    />,
  );
  try {
    await fill("identifier", "alex");
    await fill("password", "preview password");
    await submit();
    assertFailureToast("Sign in request failed");
    assert.equal(button("Sign in").disabled, false);
  } finally {
    await view.unmount();
  }
});

test("authorization reports changed submission failures once while preserving policy notices", async () => {
  const render = (error?: string) => (
    <StrictMode>
      <McpAuthorization
        brand="Avgeek"
        productName="Example"
        clientName="Example client"
        accessLevel="read"
        availableAccessLevels={["read"]}
        onAccessLevelChange={() => {}}
        error={error}
        approvalBlockedReason="Your role cannot grant access."
        onApprove={() => {}}
        onDeny={() => {}}
      />
    </StrictMode>
  );
  const view = await mount(render("Authorization failed"));
  try {
    assertFailureToast("Authorization failed");
    assert.match(
      document.body.textContent ?? "",
      /Your role cannot grant access/,
    );
    await view.render(render("Authorization failed"));
    assertFailureToast("Authorization failed");
    dangerMessages = [];
    await view.render(render());
    await view.render(render("Authorization failed"));
    assertFailureToast("Authorization failed");
  } finally {
    await view.unmount();
  }
});

test("email verification respects an app-provided resend cooldown", async () => {
  let calls = 0;
  const view = await mount(
    <EmailChangeSettings
      email="alex@example.test"
      isVerified={false}
      resendAvailableAt={Date.now() + 60000}
      onRequestChange={async () => {}}
      onCancelChange={async () => {}}
      onResendVerification={async () => {
        calls++;
      }}
    />,
  );
  try {
    const trigger = document.querySelector(
      '[aria-label="Unverified email. Resend confirmation email"]',
    );
    assert.ok(trigger);
    await click(trigger);
    const resend = [...document.querySelectorAll("button")].find((item) =>
      item.textContent?.startsWith("Resend in"),
    );
    assert.ok(resend);
    assert.equal(resend.disabled, true);
    await click(resend);
    assert.equal(calls, 0);
  } finally {
    await view.unmount();
  }
});

test("operation failures expand initially, remain collapsible, and waiting steps are disabled", async () => {
  const view = await mount(
    <OperationProgress
      steps={[
        {
          id: "build",
          title: "Build application",
          description: "Build failed",
          status: "failed",
          children: <p>Build output</p>,
        },
        {
          id: "deploy",
          title: "Start application",
          description: "Waiting for build",
          status: "waiting",
          children: <p>Not started</p>,
        },
      ]}
    />,
  );
  try {
    const failed = [...document.querySelectorAll("button")].find((item) =>
      item.textContent?.includes("Build application"),
    );
    const waiting = [...document.querySelectorAll("button")].find((item) =>
      item.textContent?.includes("Start application"),
    );
    assert.ok(failed);
    assert.ok(waiting);
    assert.equal(failed.getAttribute("aria-expanded"), "true");
    assert.equal(waiting.disabled, true);
    assert.equal(waiting.getAttribute("aria-expanded"), "false");
    await click(failed);
    assert.equal(failed.getAttribute("aria-expanded"), "false");
  } finally {
    await view.unmount();
  }
});

test("external sign-in pending blocks all submit paths and preserves the credentials", async () => {
  let calls = 0;
  const props = {
    brand: "Example",
    onSubmit: async () => {
      calls++;
    },
    onForgotPassword: () => {
      calls++;
    },
    onPasskeySignIn: () => {
      calls++;
    },
    onResendVerification: () => {
      calls++;
    },
  };
  const view = await mount(<SignIn {...props} />);
  try {
    await fill("identifier", "alex@example.test");
    await fill("password", "preview password");
    assert.doesNotMatch(
      document.body.textContent ?? "",
      /Need a new verification email/,
    );
    await view.render(<SignIn {...props} isPending />);
    for (const label of [
      "Signing in…",
      "Forgot password?",
      "Sign in with Passkey",
    ]) {
      assert.equal(button(label).disabled, true);
      await click(button(label));
    }
    await submit();
    assert.equal(calls, 0);
    await view.render(<SignIn {...props} />);
    assert.equal(
      document.querySelector<HTMLInputElement>('input[name="password"]')?.value,
      "preview password",
    );
    await submit();
    assert.equal(calls, 1);
    assert.equal(
      document.querySelector<HTMLInputElement>('input[name="password"]')?.value,
      "",
    );
  } finally {
    await view.unmount();
  }
});

test("passkey verification exposes only supported fallbacks and keeps cancellation available", async () => {
  let cancels = 0;
  let fallback = 0;
  const props = {
    brand: "Example",
    onRetry: () => {},
    onCancelRequest: () => {
      cancels++;
    },
    onBackToSignIn: () => {},
  };
  const view = await mount(<PasskeyVerification {...props} />);
  try {
    assert.doesNotMatch(
      document.body.textContent ?? "",
      /Use a recovery code|Use an authenticator code/,
    );
    await view.render(
      <PasskeyVerification
        {...props}
        isPending
        onRecoverySignIn={() => {
          fallback++;
        }}
        onAuthenticatorSignIn={() => {
          fallback++;
        }}
      />,
    );
    assert.equal(button("Use a recovery code").disabled, true);
    assert.equal(button("Use an authenticator code").disabled, true);
    await click(button("Cancel passkey request"));
    assert.equal(cancels, 1);
    assert.equal(fallback, 0);
    await view.render(
      <PasskeyVerification
        {...props}
        onRecoverySignIn={() => {
          fallback++;
        }}
      />,
    );
    await click(button("Use a recovery code"));
    assert.equal(fallback, 1);
  } finally {
    await view.unmount();
  }
});

test("custom identity verification supports app-owned ceremonies and explicit abort dismissal", async () => {
  let closes = 0;
  const props = {
    isOpen: true,
    onOpenChange: (open: boolean) => {
      if (!open) closes++;
    },
  };
  const view = await mount(
    <ConfirmIdentityDialog {...props} method="custom" isPending>
      <p>Waiting for identity verification</p>
    </ConfirmIdentityDialog>,
  );
  try {
    assert.equal(document.querySelector('input[type="password"]'), null);
    assert.equal(button("Cancel").disabled, true);
    await view.render(
      <ConfirmIdentityDialog
        {...props}
        method="custom"
        isPending
        isDismissDisabled={false}
      >
        <p>Waiting for passkey verification</p>
      </ConfirmIdentityDialog>,
    );
    await click(button("Cancel"));
    assert.equal(closes, 1);
  } finally {
    await view.unmount();
  }
});

test("API keys require explicit permission and expiry selections before submitting", async () => {
  let calls = 0;
  const view = await mount(
    <CreateApiKeyDialog
      isOpen
      onOpenChange={() => {}}
      onCreate={async (values) => {
        calls++;
        assert.deepEqual(values, {
          name: "Automation",
          permission: "read",
          expiry: "never",
        });
        return { token: "preview-key" };
      }}
    />,
  );
  try {
    assert.match(document.body.textContent ?? "", /Permissions/);
    await fill("name", "Automation");
    await submit();
    assert.equal(calls, 0);
    assert.equal(button("Create key").disabled, true);
    await chooseKeyOption("Read-only");
    await submit();
    assert.equal(calls, 0);
    await chooseKeyOption("Never");
    assert.equal(button("Create key").disabled, false);
    await submit();
    assert.equal(calls, 1);
    assert.match(document.body.textContent ?? "", /preview-key/);
  } finally {
    await view.unmount();
  }
});

test("read-only email settings expose identity without invented change or resend capabilities", async () => {
  const view = await mount(
    <EmailChangeSettings
      email="alex@example.test"
      isVerified={false}
      mode="read-only"
    >
      <p>Managed by your instance administrator.</p>
    </EmailChangeSettings>,
  );
  try {
    assert.equal(document.querySelector("form"), null);
    assert.equal(document.querySelector("button"), null);
    const input = document.querySelector<HTMLInputElement>(
      'input[type="email"]',
    );
    assert.equal(input?.readOnly, true);
    assert.equal(input?.value, "alex@example.test");
    assert.match(
      document.body.textContent ?? "",
      /Unverified|Managed by your instance administrator/,
    );
  } finally {
    await view.unmount();
  }
});

test("passkey settings omit unsupported rename and recovery actions", async () => {
  const view = await mount(
    <PasskeySettings
      items={[
        { id: "key", name: "Security key", createdAt: "2026-10-06T00:00:00Z" },
      ]}
      formatDate={() => "Today"}
      onAdd={async () => {}}
      onRemove={async () => {}}
    />,
  );
  try {
    assert.equal(button("Add passkey").disabled, false);
    assert.equal(button("Remove").disabled, false);
    assert.doesNotMatch(
      document.body.textContent ?? "",
      /Rename|Replace recovery codes/,
    );
    assert.equal(document.querySelector('[aria-label="More actions"]'), null);
  } finally {
    await view.unmount();
  }
});

test("role-only member edits cannot mutate identity fields and retain the role draft on rejection", async () => {
  let calls = 0;
  const view = await mount(
    <MemberEditDialog
      isOpen
      mode="role-only"
      member={{
        id: "alex",
        name: "Alex",
        email: "alex@example.test",
        role: "member",
      }}
      roles={[{ id: "member", label: "Member" }]}
      onOpenChange={() => {}}
      onSave={async (values) => {
        calls++;
        assert.deepEqual(values, { role: "member" });
        if (calls === 1) throw new Error("Role update failed");
      }}
    />,
  );
  try {
    assert.equal(document.querySelector('input[name="name"]'), null);
    await submit();
    assertFailureToast("Role update failed");
    assert.ok(document.querySelector('[role="dialog"]'));
    await submit();
    assert.equal(calls, 2);
  } finally {
    await view.unmount();
  }
});

test("invitations display avatar identity and members identify the current user without altering records", async () => {
  const invitation = await mount(
    <InvitationsTable
      items={[
        {
          id: "invite",
          email: "sam@example.test",
          name: "Sam",
          role: "member",
          expiresAt: "2026-10-07T00:00:00Z",
        },
      ]}
      roles={[{ id: "member", label: "Member" }]}
      formatDate={() => "Tomorrow"}
    />,
  );
  try {
    assert.ok(document.querySelector('[role="img"][aria-label="Sam"]'));
  } finally {
    await invitation.unmount();
  }
  const member = {
    id: "alex",
    name: "Alex",
    email: "alex@example.test",
    role: "member",
  };
  const members = await mount(
    <MembersTable items={[member]} currentUserId="alex" actions={() => null} />,
  );
  try {
    assert.match(document.body.textContent ?? "", /Alex \(you\)/);
    assert.equal(member.name, "Alex");
  } finally {
    await members.unmount();
  }
});

test("code copying emits toast feedback on every attempt and keeps a stable accessible action", async () => {
  const successes: ReactNode[] = [];
  mock.method(toast, "success", (message: ReactNode) => {
    successes.push(message);
    return "preview-success";
  });
  const view = await mount(
    <CodeBlock>
      <CodeBlock.Header>
        <CodeBlock.CopyButton code="preview-code" />
      </CodeBlock.Header>
      <CodeBlock.Code code="preview-code" />
    </CodeBlock>,
  );
  try {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    await click(button("Copy"));
    await click(button("Copy"));
    assert.equal(dangerMessages.length, 2);
    assert.doesNotMatch(
      document.body.textContent ?? "",
      /Could not copy|Copied/,
    );
    let copied = "";
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          copied = value;
        },
      },
    });
    await click(button("Copy"));
    assert.equal(copied, "preview-code");
    assert.deepEqual(successes, ["Copied to clipboard."]);
    assert.equal(button("Copy").getAttribute("aria-label"), "Copy code");
  } finally {
    await view.unmount();
    Reflect.deleteProperty(navigator, "clipboard");
  }
});

test("disabled authorization decisions cannot replay a consumed request and do not present pending state", async () => {
  let calls = 0;
  const view = await mount(
    <McpAuthorization
      brand="Example"
      productName="Example"
      isDisabled
      clientName="Client"
      accessLevel="read"
      availableAccessLevels={["read"]}
      onAccessLevelChange={() => {}}
      onApprove={() => {
        calls++;
      }}
      onDeny={() => {
        calls++;
      }}
    />,
  );
  try {
    await submit();
    const decisions = [...document.querySelectorAll("button")].filter((item) =>
      /Approve|Deny/.test(item.textContent ?? ""),
    );
    assert.equal(decisions.length, 2);
    for (const decision of decisions) {
      assert.equal(decision.disabled, true);
      await click(decision);
    }
    assert.equal(calls, 0);
    assert.equal(
      document.querySelector("form")?.getAttribute("aria-busy"),
      "false",
    );
  } finally {
    await view.unmount();
  }
});

test("name settings lock simultaneous submissions and retain the draft for retry after failure", async () => {
  let calls = 0;
  const pending = deferred();
  const view = await mount(
    <NameSettingsForm
      title="Team details"
      value="Existing team"
      onSave={async (name) => {
        calls++;
        assert.equal(name, "New team");
        if (calls === 1) {
          await pending.promise;
          throw new Error("Team update failed");
        }
      }}
    />,
  );
  try {
    const input = document.querySelector("input");
    assert.ok(input);
    await act(async () => {
      // oxlint-disable-next-line typescript/unbound-method -- the native value setter is called with .call(element, value)
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      assert.ok(setter);
      setter.call(input, "New team");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const form = document.querySelector("form");
    assert.ok(form);
    await act(async () => {
      for (let i = 0; i < 2; i++)
        form.dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
    });
    assert.equal(calls, 1);
    await act(async () => pending.resolve());
    assertFailureToast("Team update failed");
    assert.equal(input.value, "New team");
    await submit();
    assert.equal(calls, 2);
  } finally {
    await view.unmount();
  }
});

for (const contract of [
  {
    name: "CodeBlock",
    element: <CodeBlock.CopyButton code="private-key" />,
    label: "Copy",
    value: "private-key",
  },
  {
    name: "RecoveryCodes",
    element: (
      <RecoveryCodes
        codes={["first-code", "second-code"]}
        onContinue={() => {}}
      />
    ),
    label: "Copy codes",
    value: "first-code\nsecond-code\n",
  },
]) {
  test(`${contract.name} copying locks same-frame presses until the clipboard settles and unlocks after rejection`, async () => {
    const successes: ReactNode[] = [];
    mock.method(toast, "success", (message: ReactNode) => {
      successes.push(message);
      return "copied";
    });
    const pending = deferred();
    let writes = 0;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          assert.equal(value, contract.value);
          writes++;
          if (writes === 1) {
            await pending.promise;
            throw new Error("Clipboard denied");
          }
        },
      },
    });
    const view = await mount(contract.element);
    try {
      const copy = button(contract.label);
      await act(async () => {
        copy.click();
        copy.click();
      });
      assert.equal(writes, 1);
      assert.ok(copy.disabled || copy.getAttribute("aria-disabled") === "true");
      assert.equal(successes.length, 0);
      await act(async () => pending.resolve());
      assert.equal(dangerMessages.length, 1);
      assert.notEqual(copy.getAttribute("aria-disabled"), "true");
      assert.equal(copy.disabled, false);
      await click(copy);
      assert.equal(writes, 2);
      assert.equal(successes.length, 1);
      assert.equal(copy.textContent, contract.label);
      assert.doesNotMatch(
        document.body.textContent ?? "",
        /Could not copy|copied/i,
      );
    } finally {
      await view.unmount();
      Reflect.deleteProperty(navigator, "clipboard");
    }
  });
}

test("initial loading preserves its accessible status, app attributes, and updated announcement", async () => {
  const view = await mount(
    <QueryLoading id="loading-view" aria-label="Members loading" />,
  );
  try {
    const status = view.container.querySelector('[role="status"]');
    assert.ok(status);
    assert.equal(status.id, "loading-view");
    assert.equal(status.getAttribute("aria-label"), "Members loading");
    assert.equal(status.textContent, "Loading…");
    assert.notEqual(status.getAttribute("aria-hidden"), "true");
    await view.render(<QueryLoading>Loading invitations…</QueryLoading>);
    assert.equal(
      view.container.querySelector('[role="status"]')?.textContent,
      "Loading invitations…",
    );
    await view.render(<p>Invitations loaded.</p>);
    assert.equal(view.container.querySelector('[role="status"]'), null);
  } finally {
    await view.unmount();
  }
});

test("API key names reject whitespace with toast and focus, retain the draft, and allow a trimmed retry once", async () => {
  let calls = 0;
  const pending = deferred();
  const view = await mount(
    <CreateApiKeyDialog
      isOpen
      onOpenChange={() => {}}
      expiryOptions={[{ id: "90", label: "90 days" }]}
      onCreate={async (values) => {
        calls++;
        assert.deepEqual(values, {
          name: "Automation",
          permission: "read",
          expiry: "90",
        });
        await pending.promise;
        return { token: "preview-key" };
      }}
    />,
  );
  try {
    await chooseKeyOption("Read-only");
    await chooseKeyOption("90 days");
    await fill("name", "   ");
    for (let attempt = 0; attempt < 2; attempt++) {
      await submit();
      assert.equal(calls, 0);
      assert.equal(dangerMessages.length, attempt + 1);
      assert.equal(dangerMessages.at(-1), "Enter a name for this API key.");
      const name =
        document.querySelector<HTMLInputElement>('input[name="name"]');
      assert.equal(document.activeElement, name);
      assert.equal(name?.value, "   ");
      assert.doesNotMatch(
        document.body.textContent ?? "",
        /Enter a name for this API key/,
      );
    }
    await fill("name", " Automation ");
    const form = document.querySelector("form");
    assert.ok(form);
    await act(async () => {
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });
    assert.equal(calls, 1);
    await act(async () => pending.resolve());
    assert.match(document.body.textContent ?? "", /preview-key/);
  } finally {
    await view.unmount();
  }
});

test("passkey identity cancellation aborts before dismissal and retains the single pending attempt", async () => {
  const events: string[] = [];
  let finish!: () => void;
  let attempts = 0;
  const view = await mount(
    <ConfirmIdentityDialog
      isOpen
      method="passkey"
      onOpenChange={(open) => {
        if (!open) events.push("close");
      }}
      onCancelRequest={() => {
        events.push("abort");
      }}
      onConfirm={async () => {
        attempts++;
        await new Promise<void>((resolve) => {
          finish = resolve;
        });
      }}
    />,
  );
  try {
    const dialog = document.querySelector('[role="dialog"]');
    const description = document.getElementById(
      dialog?.getAttribute("aria-describedby") ?? "",
    );
    assert.equal(
      description?.textContent,
      "Authenticate yourself using your passkey to confirm and obtain required access.",
    );
    await click(button("Use Passkey"));
    assert.equal(button("Cancel").disabled, false);
    await click(button("Use Passkey"));
    assert.equal(attempts, 1);
    await click(button("Cancel"));
    assert.deepEqual(events, ["abort", "close"]);
    await act(async () => finish());
  } finally {
    await view.unmount();
  }
});

test("invitation password setup validates confirmation and preserves the draft after rejection", async () => {
  let attempts = 0;
  const view = await mount(
    <InvitationPasswordSetup
      brand="Example"
      teamName="Example team"
      email="alex@example.test"
      role="Member"
      onBackToSignIn={() => {}}
      onSubmit={async (values) => {
        attempts++;
        assert.deepEqual(values, {
          name: "Alex",
          password: "long preview passphrase",
        });
        throw new Error("Invitation is unavailable");
      }}
    />,
  );
  try {
    await fill("name", "Alex");
    await fill("password", "long preview passphrase");
    await fill("confirmPassword", "another preview passphrase");
    await submit();
    assert.equal(attempts, 0);
    assertFailureToast("Passwords do not match");
    dangerMessages = [];
    await fill("confirmPassword", "long preview passphrase");
    await submit();
    assert.equal(attempts, 1);
    assertFailureToast("Invitation is unavailable");
    assert.equal(
      document.querySelector<HTMLInputElement>('input[name="name"]')?.value,
      "Alex",
    );
    assert.equal(button("Create account and join").disabled, false);
  } finally {
    await view.unmount();
  }
});

test("passkey recovery completes an existing sign-in without collecting credentials again", async () => {
  let attempts = 0;
  const view = await mount(
    <PasskeyRecoveryVerification
      brand="Example"
      onPasskeyVerification={() => {}}
      onBackToSignIn={() => {}}
      onSubmit={async ({ code }) => {
        assert.equal(code, "preview-once-code");
        attempts++;
        throw new Error("Recovery code has already been used");
      }}
    />,
  );
  try {
    assert.equal(document.querySelector('input[type="password"]'), null);
    assert.equal(document.querySelector('input[type="email"]'), null);
    await fill("code", "preview-once-code");
    await submit();
    assert.equal(attempts, 1);
    assertFailureToast("Recovery code has already been used");
    assert.equal(
      document.querySelector<HTMLInputElement>('input[name="code"]')?.value,
      "preview-once-code",
    );
    assert.equal(button("Sign in").disabled, false);
  } finally {
    await view.unmount();
  }
});

test("team details retain both drafts after a failed save and lock description while pending", async () => {
  let rejectSave: (error: Error) => void = () => {};
  let attempts = 0;
  const view = await mount(
    <TeamGeneralSettings
      mode="details"
      value={{ name: "Example", description: "Original" }}
      onSave={async (values) => {
        attempts++;
        assert.deepEqual(values, {
          name: "Updated team",
          description: "Original",
        });
        await new Promise<void>((_, reject) => {
          rejectSave = reject;
        });
      }}
    />,
  );
  try {
    await fill("name", "  Updated team  ");
    await submit();
    assert.equal(attempts, 1);
    assert.equal(
      document.querySelector<HTMLTextAreaElement>("textarea")?.disabled,
      true,
    );
    await act(async () => rejectSave(new Error("Team update failed")));
    assertFailureToast("Team update failed");
    assert.equal(
      document.querySelector<HTMLTextAreaElement>("textarea")?.disabled,
      false,
    );
    assert.equal(
      document.querySelector<HTMLTextAreaElement>("textarea")?.value,
      "Original",
    );
    assert.equal(
      document.querySelector<HTMLInputElement>('input[name="name"]')?.value,
      "  Updated team  ",
    );
  } finally {
    await view.unmount();
  }
});

test("stacked resource tables keep one native row, every field and one action per record", async () => {
  const items = [{ id: "one", name: "Automation", permission: "Read only" }];
  let activations = 0;
  const columns = [
    {
      key: "name",
      header: "Name",
      isRowHeader: true,
      cell: (item: (typeof items)[number]) => item.name,
    },
    {
      key: "permissions",
      header: "Permissions",
      mobileFullWidth: true,
      cell: (item: (typeof items)[number]) => item.permission,
    },
    {
      key: "actions",
      header: "Actions",
      mobileFullWidth: true,
      cell: () => <button onClick={() => activations++}>Inspect</button>,
    },
  ];
  const view = await mount(
    <ResourceTable
      ariaLabel="Credentials"
      items={items}
      columns={columns}
      getRowKey={(item) => item.id}
      emptyTitle="No keys"
      emptyDescription="Create a key"
      mobileLayout="stacked"
    />,
  );
  try {
    assert.equal(document.querySelectorAll('[role="rowheader"]').length, 1);
    assert.equal(document.querySelectorAll('[role="gridcell"]').length, 2);
    assert.deepEqual(
      [...document.querySelectorAll('[role="columnheader"]')].map(
        (element) => element.textContent,
      ),
      ["Name", "Permissions", "Actions"],
    );
    assert.equal(document.querySelectorAll("button").length, 1);
    await click(button("Inspect"));
    assert.equal(activations, 1);
    assert.match(
      document.querySelector('[role="rowheader"]')?.textContent ?? "",
      /Automation/,
    );
    assert.match(
      document.querySelector('[role="gridcell"]')?.textContent ?? "",
      /Read only/,
    );
  } finally {
    await view.unmount();
  }
});

test("passkey verification permits cancellation only while an abort callback is available", async () => {
  const view = await mount(
    <PasskeyVerification
      brand="Example"
      isPending
      onRetry={() => {}}
      onBackToSignIn={() => {}}
    />,
  );
  try {
    assert.equal(
      [...document.querySelectorAll("button")].some(
        (item) => item.textContent === "Cancel passkey request",
      ),
      false,
    );
    assert.equal(button("← Back to Sign In").disabled, true);
    await view.render(
      <PasskeyVerification
        brand="Example"
        isPending
        onRetry={() => {}}
        onBackToSignIn={() => {}}
        onCancelRequest={() => {}}
      />,
    );
    assert.equal(button("Cancel passkey request").disabled, false);
    assert.equal(button("← Back to Sign In").disabled, false);
  } finally {
    await view.unmount();
  }
});

test("verification requests lock navigation, retain failed drafts and acknowledge without account disclosure", async () => {
  const pending = deferred();
  let calls = 0;
  let back = 0;
  const view = await mount(
    <VerificationEmail
      brand="Example"
      onBackToSignIn={() => {
        back++;
      }}
      onSubmit={async ({ email }) => {
        assert.equal(email, "alex@example.test");
        calls++;
        if (calls === 1) {
          await pending.promise;
          throw new Error("Verification request failed");
        }
      }}
    />,
  );
  try {
    await fill("email", "alex@example.test");
    await submit();
    await submit();
    assert.equal(calls, 1);
    assert.equal(button("Sending…").disabled, true);
    assert.equal(button("← Back to Sign In").disabled, true);
    await click(button("← Back to Sign In"));
    assert.equal(back, 0);
    await act(async () => pending.resolve());
    assertFailureToast("Verification request failed");
    assert.equal(
      document.querySelector<HTMLInputElement>('input[name="email"]')?.value,
      "alex@example.test",
    );
    assert.equal(button("← Back to Sign In").disabled, false);
    await submit();
    assert.equal(calls, 2);
    assert.equal(document.querySelector("form"), null);
    assert.match(
      document.body.textContent ?? "",
      /If an account needs email verification/,
    );
    assert.equal(
      document.activeElement?.textContent?.includes("Verify your email"),
      true,
    );
    await click(button("Request another link"));
    assert.equal(
      document.querySelector<HTMLInputElement>('input[name="email"]')?.value,
      "alex@example.test",
    );
    await click(button("← Back to Sign In"));
    assert.equal(back, 1);
  } finally {
    await view.unmount();
  }
});

test("sign-in blocks verification navigation during its own request and allows retry after failure", async () => {
  const pending = deferred();
  let navigations = 0;
  const view = await mount(
    <SignIn
      brand="Example"
      onForgotPassword={() => {
        navigations++;
      }}
      onResendVerification={() => {
        navigations++;
      }}
      onPasskeySignIn={() => {
        navigations++;
      }}
      onSubmit={async () => {
        await pending.promise;
        throw Object.assign(new Error("Verify your email to sign in."), {
          code: "EMAIL_NOT_VERIFIED",
        });
      }}
    />,
  );
  try {
    await fill("identifier", "alex@example.test");
    await fill("password", "preview password");
    await submit();
    for (const label of ["Forgot password?", "Sign in with Passkey"]) {
      assert.equal(button(label).disabled, true);
      await click(button(label));
    }
    assert.equal(navigations, 0);
    await act(async () => pending.resolve());
    assertFailureToast("Verify your email to sign in.");
    assert.equal(
      document.querySelector<HTMLInputElement>('input[name="password"]')?.value,
      "",
    );
    assert.equal(
      document.querySelector<HTMLInputElement>('input[name="identifier"]')
        ?.value,
      "alex@example.test",
    );
    await fill("password", "another password");
    await act(async () => window.dispatchEvent(new Event("pagehide")));
    assert.equal(
      document.querySelector<HTMLInputElement>('input[name="password"]')?.value,
      "",
    );
    await click(button("Need a new verification email?"));
    assert.equal(navigations, 1);
    await fill("identifier", "another@example.test");
    assert.doesNotMatch(
      document.body.textContent ?? "",
      /Need a new verification email/,
    );
  } finally {
    await view.unmount();
  }
});

for (const error of [
  new Error("Email not verified"),
  Object.assign(new Error("Email not verified"), {
    code: "INVALID_EMAIL_OR_PASSWORD",
  }),
]) {
  test(`sign-in ignores verification message text with code ${"code" in error ? String(error.code) : "absent"}`, async () => {
    const view = await mount(
      <SignIn
        brand="Example"
        onResendVerification={() => {}}
        onSubmit={async () => {
          throw error;
        }}
      />,
    );
    try {
      await fill("identifier", "alex@example.test");
      await fill("password", "preview password");
      await submit();
      assertFailureToast("Email not verified");
      assert.doesNotMatch(
        document.body.textContent ?? "",
        /Need a new verification email/,
      );
    } finally {
      await view.unmount();
    }
  });
}

test("visible verification recovery respects external pending state", async () => {
  const props = {
    brand: "Example",
    onResendVerification: () => {},
    onSubmit: async () => {
      throw Object.assign(new Error("Verify your email"), {
        code: "EMAIL_NOT_VERIFIED",
      });
    },
  };
  const view = await mount(<SignIn {...props} />);
  try {
    await fill("identifier", "alex@example.test");
    await fill("password", "preview password");
    await submit();
    assert.equal(button("Need a new verification email?").disabled, false);
    await view.render(<SignIn {...props} isPending />);
    assert.equal(button("Need a new verification email?").disabled, true);
  } finally {
    await view.unmount();
  }
});

test("sign-in omits actions whose capabilities are unavailable", async () => {
  const view = await mount(
    <SignIn brand="Example" onSubmit={async () => {}} />,
  );
  try {
    assert.doesNotMatch(
      document.body.textContent ?? "",
      /Forgot password|Need a new verification email|Sign in with Passkey/,
    );
    assert.match(document.body.textContent ?? "", /Sign in to your account/);
  } finally {
    await view.unmount();
  }
});

for (const purpose of ["verify-email", "email-change"] as const) {
  test(`email confirmation ${purpose} is explicit, locks pending actions and retains retry after failure`, async () => {
    const first = deferred();
    let requests = 0;
    let back = 0;
    const successes: ReactNode[] = [];
    mock.method(toast, "success", (message: ReactNode) => {
      successes.push(message);
      return "confirmed";
    });
    const common = {
      brand: "Example",
      purpose,
      onBackToSignIn: () => {
        back++;
      },
    };
    const confirm = async () => {
      requests++;
      if (requests === 1) {
        await first.promise;
        throw new Error("Confirmation failed");
      }
      toast.success("Confirmation completed");
    };
    const view = await mount(
      <EmailConfirmation {...common} status="ready" onConfirm={confirm} />,
    );
    try {
      assert.equal(requests, 0);
      const action = button(
        purpose === "email-change" ? "Confirm email change" : "Confirm email",
      );
      await act(async () => {
        action.click();
        action.click();
      });
      assert.equal(requests, 1);
      assert.equal(action.getAttribute("aria-disabled"), "true");
      await click(button("← Back to Sign In"));
      assert.equal(back, 0);
      assert.equal(dangerMessages.length, 0);
      await act(async () => first.resolve());
      assertFailureToast("Confirmation failed");
      await click(action);
      assert.equal(requests, 2);
      assert.deepEqual(successes, ["Confirmation completed"]);
      await view.render(<EmailConfirmation {...common} status="confirmed" />);
      assert.match(document.body.textContent ?? "", /Sign in to continue/);
      assert.doesNotMatch(
        document.body.textContent ?? "",
        /Confirmation completed|Email verified|Email updated/,
      );
      await view.render(<EmailConfirmation {...common} status="unavailable" />);
      assert.equal(view.container.querySelectorAll("button").length, 1);
      await click(button("← Back to Sign In"));
      assert.equal(back, 1);
      await view.render(<EmailConfirmation {...common} status="checking" />);
      assert.equal(button("← Back to Sign In").disabled, true);
      assert.match(
        view.container.querySelector('[role="status"]')?.textContent ?? "",
        /Checking/,
      );
      assert.equal(requests, 2);
    } finally {
      await view.unmount();
    }
  });
}

test("invitation verification shares its resend lock, retains drafts and respects server cooldown", async () => {
  const resend = deferred();
  const verification = deferred();
  let resends = 0;
  let submissions = 0;
  const successes: ReactNode[] = [];
  mock.method(toast, "success", (message: ReactNode) => {
    successes.push(message);
    return "sent";
  });
  const props = {
    brand: "Example",
    teamName: "Example",
    onSubmit: async () => {
      submissions++;
      await verification.promise;
      throw new Error("Verification failed");
    },
    onResendCode: async () => {
      resends++;
      if (resends === 1) {
        await resend.promise;
        throw new Error("Resend failed");
      }
    },
  };
  const view = await mount(<InvitationVerification {...props} />);
  try {
    await fill("name", "Alex");
    await fill("code", "123456");
    const name = document.querySelector<HTMLInputElement>('[name="name"]');
    const code = document.querySelector<HTMLInputElement>('[name="code"]');
    assert.ok(name);
    assert.ok(code);
    const resendButton = button("Resend code");
    await act(async () => {
      resendButton.click();
      resendButton.click();
    });
    await submit();
    assert.equal(resends, 1);
    assert.equal(submissions, 0);
    assert.equal(dangerMessages.length, 0);
    assert.equal(name.matches(":disabled"), true);
    await act(async () => resend.resolve());
    assertFailureToast("Resend failed");
    assert.equal(name.value, "Alex");
    assert.equal(code.value, "123456");
    await click(resendButton);
    assert.equal(resends, 2);
    assert.deepEqual(successes, ["Verification code requested."]);
    await view.render(
      <InvitationVerification
        {...props}
        resendAvailableAt={Date.now() + 60000}
      />,
    );
    const cooldown = [...view.container.querySelectorAll("button")].find(
      (item) => item.textContent?.startsWith("Resend in"),
    );
    assert.ok(cooldown);
    assert.equal(cooldown.disabled, true);
    await click(cooldown);
    assert.equal(resends, 2);
    await view.render(
      <InvitationVerification {...props} resendAvailableAt={0} />,
    );
    await submit();
    await click(button("Resend code"));
    assert.equal(submissions, 1);
    assert.equal(resends, 2);
    await act(async () => verification.resolve());
    assert.deepEqual(dangerMessages, ["Resend failed", "Verification failed"]);
    assert.equal(name.value, "Alex");
    assert.equal(code.value, "123456");
    assert.doesNotMatch(
      document.body.textContent ?? "",
      /Resend failed|Verification failed|Verification code requested/,
    );
    await view.render(
      <InvitationVerification {...props} onResendCode={undefined} />,
    );
    assert.equal(
      [...view.container.querySelectorAll("button")].some((item) =>
        item.textContent?.includes("Resend"),
      ),
      false,
    );
  } finally {
    await view.unmount();
  }
});

async function selectUpload(file: File) {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]');
  assert.ok(input);
  Object.defineProperty(input, "files", {
    configurable: true,
    value: { length: 1, item: () => file },
  });
  await act(async () =>
    input.dispatchEvent(new Event("change", { bubbles: true })),
  );
}

test("file upload locks duplicates, preserves failed files for retry and clears successful selection", async () => {
  const file = new File(["image"], "diagram.png", { type: "image/png" });
  const pending = deferred();
  const received: File[] = [];
  const view = await mount(
    <FileUpload
      onUpload={async (selected) => {
        received.push(selected);
        if (received.length === 1) {
          await pending.promise;
          throw new Error("Storage could not be reached");
        }
      }}
    />,
  );
  try {
    const uploadButton = view.container.querySelector("button");
    assert.ok(uploadButton);
    await selectUpload(file);
    assert.equal(uploadButton.disabled, true);
    await selectUpload(file);
    assert.equal(received.length, 1);
    await act(async () => pending.resolve());
    assertFailureToast("Storage could not be reached");
    assert.match(view.container.textContent ?? "", /diagram.png/);
    await click(uploadButton);
    assert.deepEqual(received, [file, file]);
    assert.doesNotMatch(view.container.textContent ?? "", /diagram.png/);
    assert.equal(uploadButton.disabled, false);
  } finally {
    await view.unmount();
  }
});

test("file upload rejects unsupported and oversized files without mutation, including drops", async () => {
  let calls = 0;
  const view = await mount(
    <FileUpload
      accept="application/pdf,.png"
      maxSizeBytes={8}
      onUpload={async () => {
        calls++;
      }}
    />,
  );
  try {
    await selectUpload(
      new File(["content"], "script.js", { type: "text/javascript" }),
    );
    await selectUpload(
      new File(["more than eight bytes"], "report.pdf", {
        type: "application/pdf",
      }),
    );
    assert.equal(calls, 0);
    assert.deepEqual(dangerMessages, [
      "Choose a supported file type.",
      "This file exceeds the upload size limit.",
    ]);
    const event = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "dataTransfer", {
      value: {
        types: ["Files"],
        files: {
          length: 1,
          item: () => new File(["png"], "picture.PNG", { type: "" }),
        },
      },
    });
    await act(async () =>
      view.container.firstElementChild?.dispatchEvent(event),
    );
    assert.equal(event.defaultPrevented, true);
    assert.equal(calls, 1);
    await view.render(
      <FileUpload
        isDisabled
        onUpload={async () => {
          calls++;
        }}
      />,
    );
    await selectUpload(
      new File(["content"], "picture.png", { type: "image/png" }),
    );
    assert.equal(calls, 1);
  } finally {
    await view.unmount();
  }
});

test("initial file uploads once in StrictMode, retains failed retry and ignores later seeds", async () => {
  const file = new File(["image"], "dropped.png", { type: "image/png" });
  const later = new File(["image"], "later.png", { type: "image/png" });
  const pending = deferred();
  const received: File[] = [];
  const onUpload = async (selected: File) => {
    received.push(selected);
    if (received.length === 1) {
      await pending.promise;
      throw new Error("Initial upload failed");
    }
  };
  const view = await mount(
    <StrictMode>
      <FileUpload initialFile={file} onUpload={onUpload} />
    </StrictMode>,
  );
  try {
    assert.deepEqual(received, [file]);
    assert.equal(view.container.querySelector("button")?.disabled, true);
    await view.render(
      <StrictMode>
        <FileUpload initialFile={later} onUpload={onUpload} />
      </StrictMode>,
    );
    assert.deepEqual(received, [file]);
    await act(async () => pending.resolve());
    assertFailureToast("Initial upload failed");
    assert.match(view.container.textContent ?? "", /dropped.png/);
    const retry = view.container.querySelector("button");
    assert.ok(retry);
    await click(retry);
    assert.deepEqual(received, [file, file]);
    assert.doesNotMatch(view.container.textContent ?? "", /dropped.png/);
    await view.render(
      <StrictMode>
        <FileUpload initialFile={later} onUpload={onUpload} />
      </StrictMode>,
    );
    assert.deepEqual(received, [file, file]);
  } finally {
    await view.unmount();
  }
});

test("initial files use the same type and size validation before uploading", async () => {
  let calls = 0;
  for (const file of [
    new File(["content"], "script.js", { type: "text/javascript" }),
    new File(["more than eight bytes"], "large.pdf", {
      type: "application/pdf",
    }),
  ]) {
    const view = await mount(
      <StrictMode>
        <FileUpload
          initialFile={file}
          maxSizeBytes={8}
          onUpload={async () => {
            calls++;
          }}
        />
      </StrictMode>,
    );
    try {
      assert.equal(calls, 0);
    } finally {
      await view.unmount();
    }
  }
  assert.deepEqual(dangerMessages, [
    "Choose a supported file type.",
    "This file exceeds the upload size limit.",
  ]);
});

test("initially disabled file upload requires an explicit action after enabling", async () => {
  const file = new File(["image"], "dropped.png", { type: "image/png" });
  const received: File[] = [];
  const onUpload = async (selected: File) => {
    received.push(selected);
  };
  const view = await mount(
    <StrictMode>
      <FileUpload initialFile={file} isDisabled onUpload={onUpload} />
    </StrictMode>,
  );
  try {
    assert.deepEqual(received, []);
    await view.render(
      <StrictMode>
        <FileUpload initialFile={file} onUpload={onUpload} />
      </StrictMode>,
    );
    assert.deepEqual(received, []);
    const retry = view.container.querySelector("button");
    assert.ok(retry);
    await click(retry);
    assert.deepEqual(received, [file]);
    assert.equal(dangerMessages.length, 0);
    assert.doesNotMatch(view.container.textContent ?? "", /dropped.png/);
  } finally {
    await view.unmount();
  }
});
