import "./dom-environment.js";
import assert from "node:assert/strict";
import test, { afterEach, beforeEach, mock } from "node:test";
import { act, StrictMode, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { OperationProgress } from "../src/patterns/operations/operation-progress.js";
import { AuthForm } from "../src/patterns/auth/auth-form.js";
import { AsyncActionButton } from "../src/patterns/actions/async-action-button.js";
import { ActionConfirmation } from "../src/patterns/actions/action-confirmation.js";
import { PeopleDirectory } from "../src/patterns/team-settings/people-directory.js";
import { WorkspaceMembersSettings } from "../src/patterns/team-settings/workspace-members-settings.js";
import { CreateApiKeyDialog } from "../src/patterns/account-settings/create-api-key-dialog.js";
import { NotificationDestinationsSettings } from "../src/patterns/notification-settings/notification-destinations-settings.js";
import { FilterDialog } from "../src/patterns/filters/filter-dialog.js";
import { toast } from "../src/overlays/toast.js";
import { McpAuthorization } from "../src/patterns/auth/mcp-authorization.js";

import { NameSettingsForm } from "../src/patterns/settings/name-form.js";
import { TeamGeneralSettings } from "../src/patterns/team-settings/team-general-settings.js";
import { CodeBlock } from "../src/typography/code-block.js";

import { ResourceTable } from "../src/patterns/resource-table.js";
import { FileUpload } from "../src/patterns/file-upload.js";
import { QueryLoading } from "../src/patterns/feedback/query-state.js";
import { Accordion } from "../src/data-display/accordion.js";
import { ProgressChecklistItem } from "../src/patterns/operations/progress-checklist-item.js";
import { ChoiceField } from "../src/patterns/choice-field.js";
import { HistorySearch } from "../src/patterns/history/history-search.js";
import { Dialog } from "../src/overlays/dialog.js";
import { OverlaySuspensionScope } from "../src/overlays/overlay-suspension.js";
import { DatePickerField } from "../src/patterns/date-picker-field.js";
import { RelativeTime } from "../src/data-display/relative-time.js";

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
// Options are named by their label, or their label then description.
const optionNamed = (option: HTMLOptionElement, label: string) =>
  option.textContent === label ||
  (option.textContent ?? "").startsWith(`${label} `);
async function chooseKeyOption(label: string) {
  const select = [...document.querySelectorAll("select")].find((element) =>
    [...element.options].some((option) => optionNamed(option, label)),
  );
  assert.ok(select, `Missing selection option: ${label}`);
  const option = [...select.options].find((item) => optionNamed(item, label));
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

test("API key creation retains the name on failure and removes the revealed secret on close", async () => {
  let calls = 0;
  function Example() {
    const [isOpen, setOpen] = useState(true);
    return (
      <CreateApiKeyDialog
        isOpen={isOpen}
        onOpenChange={setOpen}
        ceilings={["viewer"]}
        expiryOptions={[{ id: "90", label: "90 days" }]}
        onCreate={async (values) => {
          calls++;
          assert.deepEqual(values, {
            name: "Automation",
            ceiling: "viewer",
            workspace: null,
            expiresInSeconds: 90 * 86_400,
          });
          if (calls === 1) throw new Error("Creation failed");
          return { key: "preview-secret" };
        }}
      />
    );
  }
  const view = await mount(<Example />);
  try {
    await fill("name", "Automation");
    await chooseKeyOption("Viewer");
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

const consentClient = {
  name: "Example client",
  redirectHost: "client.example.test",
  localhost: false,
};
test("authorization reports changed submission failures once while preserving policy notices", async () => {
  const render = (error?: string) => (
    <StrictMode>
      <McpAuthorization
        brand="Avgeek"
        productName="Example"
        client={consentClient}
        ceiling="viewer"
        ceilings={["viewer"]}
        onCeilingChange={() => {}}
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

test("API keys require an explicit role and expiry, offer only roles up to the person's own, and send workspaces", async () => {
  const submitted: unknown[] = [];
  const view = await mount(
    <CreateApiKeyDialog
      isOpen
      onOpenChange={() => {}}
      ceilings={["viewer", "member"]}
      workspaces={[{ id: "ops", label: "Operations" }]}
      onCreate={async (values) => {
        submitted.push(values);
        return { key: "preview-key" };
      }}
    />,
  );
  try {
    const roles = [...document.querySelectorAll("select")]
      .flatMap((select) => [...select.options])
      .map((option) => option.textContent);
    assert.ok(roles.some((label) => label?.startsWith("Member")));
    assert.ok(!roles.some((label) => label?.startsWith("Admin")));
    await fill("name", "Automation");
    await submit();
    assert.equal(submitted.length, 0);
    assert.equal(button("Create key").disabled, true);
    await chooseKeyOption("Member");
    await submit();
    assert.equal(submitted.length, 0);
    await chooseKeyOption("Never");
    await chooseKeyOption("Operations");
    assert.equal(button("Create key").disabled, false);
    await submit();
    assert.deepEqual(submitted, [
      {
        name: "Automation",
        ceiling: "member",
        workspace: "ops",
        expiresInSeconds: null,
      },
    ]);
    assert.match(document.body.textContent ?? "", /preview-key/);
  } finally {
    await view.unmount();
  }
});

test("a create that the app takes over, such as for step-up, closes without a secret or toast", async () => {
  const changes: boolean[] = [];
  const view = await mount(
    <CreateApiKeyDialog
      isOpen
      onOpenChange={(open) => changes.push(open)}
      ceilings={["admin"]}
      onCreate={async () => undefined}
    />,
  );
  try {
    await fill("name", "Admin key");
    await chooseKeyOption("Admin");
    await chooseKeyOption("Never");
    await submit();
    assert.deepEqual(changes, [false]);
    assert.deepEqual(dangerMessages, []);
    assert.doesNotMatch(document.body.textContent ?? "", /Copy your API key/);
  } finally {
    await view.unmount();
  }
});

test("the people directory is read-only, marks suspended and deactivated people and identifies the current user", async () => {
  const person = {
    id: "alex",
    name: "Alex",
    email: "alex@example.test",
    role: "member" as const,
    roleSource: "scim" as const,
    lastSignInAt: null,
  };
  const view = await mount(
    <PeopleDirectory
      items={[
        person,
        { ...person, id: "lee", name: "Lee", role: null },
        { ...person, id: "kim", name: "Kim", active: false },
      ]}
      providerName="authentik"
      currentUserId="alex"
      formatDate={() => "Yesterday"}
    />,
  );
  try {
    const text = document.body.textContent ?? "";
    assert.match(text, /Alex \(you\)/);
    assert.equal(person.name, "Alex");
    assert.match(text, /Suspended/);
    assert.match(text, /Deactivated/);
    assert.match(text, /Access is managed in authentik/);
    assert.match(text, /SCIM/);
    assert.match(text, /Never/);
    assert.equal(document.querySelectorAll("button, select, input").length, 0);
  } finally {
    await view.unmount();
  }
});

test("workspace members can be added from the directory, never suspended people, and removal is confirmed", async () => {
  const calls: string[] = [];
  const person = (id: string, role: "member" | null = "member") => ({
    id,
    name: id,
    email: `${id}@example.test`,
    role,
    lastSignInAt: null,
  });
  const view = await mount(
    <WorkspaceMembersSettings
      workspaceName="Operations"
      providerName="authentik"
      members={[person("ada")]}
      people={[person("ada"), person("sam"), person("lee", null)]}
      formatDate={(value) => value}
      onAdd={async (id) => {
        calls.push(`add ${id}`);
      }}
      onRemove={async (id) => {
        calls.push(`remove ${id}`);
      }}
    />,
  );
  try {
    await click(button("Add people"));
    const options = [...document.querySelectorAll("select")]
      .flatMap((select) => [...select.options])
      .map((option) => option.textContent);
    assert.ok(options.some((label) => label?.startsWith("sam")));
    assert.ok(!options.some((label) => label?.startsWith("lee")));
    assert.ok(!options.some((label) => label?.startsWith("ada")));
    await chooseKeyOption(
      options.find((label) => label?.startsWith("sam")) ?? "sam",
    );
    await click(button("Add"));
    assert.deepEqual(calls, ["add sam"]);
    await click(button("Remove"));
    assert.match(
      document.body.textContent ?? "",
      /Remove ada from Operations\?/,
    );
    assert.deepEqual(calls, ["add sam"]);
    const confirm = [...document.querySelectorAll("button")].filter(
      (item) => item.textContent?.trim() === "Remove",
    );
    await click(confirm.at(-1) ?? button("Remove"));
    assert.deepEqual(calls, ["add sam", "remove ada"]);
  } finally {
    await view.unmount();
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
      client={consentClient}
      ceiling="viewer"
      ceilings={["viewer"]}
      onCeilingChange={() => {}}
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
      ceilings={["viewer"]}
      expiryOptions={[{ id: "90", label: "90 days" }]}
      onCreate={async (values) => {
        calls++;
        assert.deepEqual(values, {
          name: "Automation",
          ceiling: "viewer",
          workspace: null,
          expiresInSeconds: 90 * 86_400,
        });
        await pending.promise;
        return { key: "preview-key" };
      }}
    />,
  );
  try {
    await chooseKeyOption("Viewer");
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

function checklist(
  status: "running" | "failed" | "succeeded",
  props: {
    defaultExpanded?: boolean;
    defaultExpandedKeys?: readonly string[];
  } = {},
) {
  return (
    <Accordion
      allowsMultipleExpanded
      defaultExpandedKeys={props.defaultExpandedKeys}
    >
      <ProgressChecklistItem
        id="build"
        title="Build application"
        description="Build"
        status={status}
        defaultExpanded={props.defaultExpanded}
      >
        <p>Build output</p>
      </ProgressChecklistItem>
    </Accordion>
  );
}
function checklistTrigger() {
  const trigger = [...document.querySelectorAll("button")].find((item) =>
    item.textContent?.includes("Build application"),
  );
  assert.ok(trigger);
  return trigger;
}

test("checklist items in an app Accordion expand when they fail until the user toggles them", async () => {
  const view = await mount(<StrictMode>{checklist("running")}</StrictMode>);
  try {
    assert.equal(checklistTrigger().getAttribute("aria-expanded"), "false");
    await view.render(<StrictMode>{checklist("failed")}</StrictMode>);
    assert.equal(checklistTrigger().getAttribute("aria-expanded"), "true");
    await click(checklistTrigger());
    assert.equal(checklistTrigger().getAttribute("aria-expanded"), "false");
    await view.render(<StrictMode>{checklist("running")}</StrictMode>);
    await view.render(<StrictMode>{checklist("failed")}</StrictMode>);
    assert.equal(checklistTrigger().getAttribute("aria-expanded"), "false");
  } finally {
    await view.unmount();
  }
});

test("checklist defaultExpanded opts in or out, and app-expanded items stay open", async () => {
  for (const [status, props, expanded] of [
    ["failed", { defaultExpanded: false }, "false"],
    ["succeeded", { defaultExpanded: true }, "true"],
    ["succeeded", { defaultExpandedKeys: ["build"] }, "true"],
  ] as const) {
    const view = await mount(checklist(status, props));
    try {
      assert.equal(checklistTrigger().getAttribute("aria-expanded"), expanded);
    } finally {
      await view.unmount();
    }
  }
});

test("choice field keeps hidden labels and descriptions accessible and selects by full option text", async () => {
  const changes: string[] = [];
  const view = await mount(
    <ChoiceField
      label="Board"
      hideLabel
      description="Tasks move with their comments."
      value="roadmap"
      onChange={(value) => changes.push(value)}
      options={[
        { id: "roadmap", label: "Roadmap", endContent: "42" },
        { id: "", label: "Unassigned", muted: true },
        {
          id: "archive",
          label: "Archive",
          description: "Read-only",
          endContent: "318",
        },
      ]}
    />,
  );
  try {
    const label = view.container.querySelector('[data-slot="label"]');
    assert.equal(label?.textContent, "Board");
    assert.match(label.className, /\bsr-only\b/);
    const trigger = view.container.querySelector("button");
    assert.ok(trigger);
    const descriptionId = [
      ...view.container.querySelectorAll('[slot="description"]'),
    ].find(
      (item) => item.textContent === "Tasks move with their comments.",
    )?.id;
    assert.ok(descriptionId);
    assert.match(
      trigger.getAttribute("aria-describedby") ?? "",
      new RegExp(descriptionId),
    );
    assert.match(trigger.textContent ?? "", /Roadmap\s*42/);
    await chooseKeyOption("Archive Read-only 318");
    await chooseKeyOption("Unassigned");
    assert.deepEqual(changes, ["archive", ""]);
  } finally {
    await view.unmount();
  }
});

test("history search shows an applied value and replaces the draft when it changes", async () => {
  const searches: string[] = [];
  const onSearch = (value: string) => searches.push(value);
  const view = await mount(
    <HistorySearch label="Search" value="invitation" onSearch={onSearch} />,
  );
  try {
    const input = view.container.querySelector("input");
    assert.ok(input);
    assert.equal(input.value, "invitation");
    await act(async () => {
      // oxlint-disable-next-line typescript/unbound-method -- the native value setter is called with .call(element, value)
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      assert.ok(setter);
      setter.call(input, "draft");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    assert.equal(input.value, "draft");
    await view.render(
      <HistorySearch label="Search" value="" onSearch={onSearch} />,
    );
    assert.equal(input.value, "");
    assert.deepEqual(searches, []);
  } finally {
    await view.unmount();
  }
});

test("dialog closes through onClose, honors disabled dismissal and ignores dismissal while suspended", async () => {
  let closes = 0;
  const dialog = (suspended: boolean, isDismissDisabled = false) => (
    <OverlaySuspensionScope isSuspended={suspended}>
      <Dialog
        open
        onClose={() => closes++}
        title={<span>Rename board</span>}
        isDismissDisabled={isDismissDisabled}
        footer={<button type="button">Save</button>}
      >
        <p>Body</p>
      </Dialog>
    </OverlaySuspensionScope>
  );
  const view = await mount(dialog(true));
  try {
    assert.equal(document.querySelector('[role="dialog"]'), null);
    await view.render(dialog(false, true));
    assert.match(
      document.querySelector('[role="dialog"]')?.textContent ?? "",
      /Rename board.*Body.*Save/,
    );
    const close = document.querySelector<HTMLButtonElement>(
      'button[aria-label="Close"]',
    );
    assert.ok(close);
    assert.equal(close.disabled, true);
    await view.render(dialog(false));
    await click(close);
    assert.equal(closes, 1);
  } finally {
    await view.unmount();
  }
});

test("date picker field clears to null, returns focus to the calendar button and hides clearing when disabled", async () => {
  const values: (string | null)[] = [];
  const field = (isDisabled: boolean) => (
    <DatePickerField
      label="Due date"
      value="2026-10-16"
      isDisabled={isDisabled}
      onChange={(value) => values.push(value)}
    />
  );
  const view = await mount(field(false));
  try {
    const clear = view.container.querySelector<HTMLButtonElement>(
      'button[aria-label="Clear due date"]',
    );
    assert.ok(clear);
    await click(clear);
    assert.deepEqual(values, [null]);
    assert.equal(
      document.activeElement?.getAttribute("aria-label"),
      "Choose due date",
    );
    await view.render(field(true));
    assert.equal(
      view.container.querySelector('button[aria-label="Clear due date"]'),
      null,
    );
  } finally {
    await view.unmount();
  }
});

test("relative time renders relative text once mounted and a dash for missing values", async () => {
  const formatAbsolute = (value: Date) => value.toISOString().slice(0, 10);
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60_000).toISOString();
  const soon = new Date(Date.now() + 20_000).toISOString();
  const view = await mount(
    <>
      <RelativeTime
        value={fiveMinutesAgo}
        label="Last synced"
        display="relative"
        locale="en"
        formatAbsolute={formatAbsolute}
        timeZone="UTC"
      />
      <RelativeTime
        value={soon}
        label="Created"
        locale="en"
        formatAbsolute={formatAbsolute}
        timeZone="UTC"
      />
      <RelativeTime
        value="not a date"
        label="Last used"
        formatAbsolute={formatAbsolute}
        timeZone="UTC"
      />
    </>,
  );
  try {
    const times = view.container.querySelectorAll("time");
    assert.equal(times[0]?.textContent, "Last synced 5 minutes ago");
    assert.equal(times[0]?.getAttribute("datetime"), fiveMinutesAgo);
    assert.match(
      times[1]?.getAttribute("aria-label") ?? "",
      /^Created: \d{4}-\d{2}-\d{2} UTC, now$/,
    );
    assert.ok(
      view.container.querySelector('[aria-label="Last used unavailable"]'),
    );
  } finally {
    await view.unmount();
  }
});
