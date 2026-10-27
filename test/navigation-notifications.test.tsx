import "./dom-environment.js";
import assert from "node:assert/strict";
import test, { afterEach, beforeEach, mock } from "node:test";
import { act, createRef, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import {
  NotificationMenu,
  type NotificationItem,
} from "../src/patterns/notifications.js";
import {
  SecondaryItems,
  SecondarySidebarLayout,
} from "../src/navigation/secondary-sidebar.js";
import {
  MobileNavigationContext,
  useMobileNavigation,
} from "../src/hooks/app-navigation.js";
import { RouteProvider } from "../src/hooks/route-context.js";
import { ApplicationSidebar } from "../src/layouts/app-shell.js";
import { toast } from "../src/overlays/toast.js";

import {
  BreadcrumbDropdown,
  BreadcrumbSelect,
} from "../src/navigation/breadcrumbs.js";
import { ListBox } from "../src/forms/select.js";

let errors: ReactNode[];
beforeEach(() => {
  errors = [];
  mock.method(toast, "danger", (message: ReactNode) => {
    errors.push(message);
    return "test-toast";
  });
});
afterEach(() => mock.restoreAll());
async function mount(content: ReactNode) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => root.render(content));
  return {
    async render(next: ReactNode) {
      await act(async () => root.render(next));
    },
    async unmount() {
      await act(async () => root.unmount());
      container.remove();
    },
  };
}
function link() {
  const element =
    document.querySelector<HTMLAnchorElement>('a[href="/tasks/1"]');
  assert.ok(element);
  return element;
}
function click(element: Element, options: MouseEventInit = {}) {
  element.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true, ...options }),
  );
}
const item: NotificationItem = {
  id: "1",
  title: "Task assigned",
  href: "/tasks/1",
  icon: "",
  time: "now",
  unread: true,
};

test("mobile navigation restoration defaults stay compatible with existing context providers", async () => {
  function Status() {
    const { isRestoringFocus } = useMobileNavigation();
    return <output>{String(isRestoringFocus)}</output>;
  }
  const view = await mount(<Status />);
  assert.equal(document.querySelector("output")?.textContent, "false");
  const value = {
    host: null,
    isMobile: true,
    close: () => {},
    registerSecondaryNavigation: () => () => {},
  };
  await view.render(
    <MobileNavigationContext.Provider value={value}>
      <Status />
    </MobileNavigationContext.Provider>,
  );
  assert.equal(document.querySelector("output")?.textContent, "false");
  await view.render(
    <MobileNavigationContext.Provider
      value={{ ...value, isRestoringFocus: true }}
    >
      <Status />
    </MobileNavigationContext.Provider>,
  );
  assert.equal(document.querySelector("output")?.textContent, "true");
  await view.unmount();
});

test("secondary links retain router and modified-click behavior; actions and disabled items stay buttons", async () => {
  const host = document.createElement("nav");
  document.body.append(host);
  let closes = 0;
  const routes: string[] = [];
  const actions: string[] = [];
  const view = await mount(
    <RouteProvider pathname="/profile" navigate={(href) => routes.push(href)}>
      <MobileNavigationContext.Provider
        value={{
          host,
          isMobile: true,
          close: () => closes++,
          registerSecondaryNavigation: () => () => {},
        }}
      >
        <SecondarySidebarLayout>
          <SecondaryItems
            selected="profile"
            onSelect={(id) => actions.push(id)}
            items={[
              { id: "profile", label: "Profile", href: "/profile" },
              {
                id: "locked",
                label: "Locked",
                href: "/locked",
                disabled: true,
                disabledReason: "Unavailable",
              },
              { id: "action", label: "Action" },
            ]}
          />
        </SecondarySidebarLayout>
      </MobileNavigationContext.Provider>
    </RouteProvider>,
  );
  const profile = host.querySelector<HTMLAnchorElement>('a[href="/profile"]');
  assert.ok(profile);
  assert.equal(profile.getAttribute("aria-current"), "page");
  await act(async () => click(profile, { ctrlKey: true }));
  assert.deepEqual(routes, []);
  assert.equal(closes, 0);
  await act(async () => click(profile));
  assert.deepEqual(routes, ["/profile"]);
  assert.equal(closes, 1);
  assert.deepEqual(actions, []);
  const buttons = host.querySelectorAll("button");
  assert.equal(buttons[0]?.disabled, true);
  assert.equal(host.querySelector('a[href="/locked"]'), null);
  const actionButton = buttons[1];
  assert.ok(actionButton);
  await act(async () => click(actionButton));
  assert.deepEqual(actions, ["action"]);
  assert.equal(closes, 2);
  await view.unmount();
  host.remove();
});

test("notification opening and modified links never activate or mark items", async () => {
  let activates = 0;
  const changes: boolean[] = [];
  const view = await mount(
    <NotificationMenu
      defaultIsOpen
      items={[item]}
      unreadCount={1}
      onOpenChange={(open) => changes.push(open)}
      onActivate={() => {
        activates++;
      }}
    />,
  );
  assert.equal(activates, 0);
  await act(async () => click(link(), { metaKey: true }));
  await act(async () => click(link(), { shiftKey: true }));
  await act(async () => click(link(), { button: 1 }));
  assert.equal(activates, 0);
  assert.deepEqual(changes, []);
  assert.ok(document.querySelector('[role="dialog"]'));
  await view.unmount();
});

test("notification activation waits once before app navigation and menu dismissal", async () => {
  let finish: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  let activates = 0;
  const effects: string[] = [];
  const view = await mount(
    <NotificationMenu
      defaultIsOpen
      items={[item]}
      unreadCount={1}
      onOpenChange={(open) => effects.push(`open:${open}`)}
      onActivate={async (selected) => {
        assert.equal(selected, item);
        activates++;
        await pending;
        effects.push("navigate");
      }}
    />,
  );
  await act(async () => {
    click(link());
    click(link());
  });
  assert.equal(activates, 1);
  assert.deepEqual(effects, []);
  assert.equal(link().getAttribute("aria-busy"), "true");
  assert.match(document.body.textContent ?? "", /Opening notification/);
  const complete = finish;
  assert.ok(complete);
  await act(async () => complete());
  assert.deepEqual(effects, ["navigate", "open:false"]);
  assert.deepEqual(errors, []);
  await view.unmount();
});

test("activation rejection emits one toast and keeps the menu available for retry", async () => {
  let attempts = 0;
  const changes: boolean[] = [];
  const view = await mount(
    <NotificationMenu
      defaultIsOpen
      items={[item]}
      unreadCount={1}
      onOpenChange={(open) => changes.push(open)}
      onActivate={async () => {
        attempts++;
        if (attempts === 1)
          throw new Error("Could not mark this notification read");
      }}
    />,
  );
  await act(async () => click(link()));
  assert.deepEqual(errors, ["Could not mark this notification read"]);
  assert.doesNotMatch(
    document.body.textContent ?? "",
    /Could not mark this notification read/,
  );
  assert.deepEqual(changes, []);
  assert.equal(link().getAttribute("aria-busy"), "false");
  await act(async () => click(link()));
  assert.equal(attempts, 2);
  assert.deepEqual(changes, [false]);
  await view.unmount();
});

test("a settled activation does not dismiss a later controlled menu session", async () => {
  let finish: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const changes: boolean[] = [];
  const content = (open: boolean) => (
    <NotificationMenu
      isOpen={open}
      items={[item]}
      unreadCount={1}
      onOpenChange={(next) => changes.push(next)}
      onActivate={() => pending}
    />
  );
  const view = await mount(content(true));
  await act(async () => click(link()));
  await view.render(content(false));
  await view.render(content(true));
  const complete = finish;
  assert.ok(complete);
  await act(async () => complete());
  assert.deepEqual(changes, []);
  assert.ok(document.querySelector('[role="dialog"]'));
  await view.unmount();
});

test("custom empty recovery suppresses false empty copy and footer composes pagination", async () => {
  const view = await mount(
    <NotificationMenu
      defaultIsOpen
      items={[]}
      unreadCount={0}
      emptyContent={<button>Try again</button>}
      footer={<button>Load more</button>}
    />,
  );
  assert.match(document.body.textContent ?? "", /Try again/);
  assert.match(document.body.textContent ?? "", /Load more/);
  assert.doesNotMatch(document.body.textContent ?? "", /No notifications yet/);
  await view.unmount();
});

test("brand updates navigate independently from the home link", async () => {
  const routes: string[] = [];
  const view = await mount(
    <RouteProvider pathname="/services" navigate={(href) => routes.push(href)}>
      <ApplicationSidebar
        config={{
          accessibleLabel: "Primary navigation",
          brand: {
            id: "test",
            title: "Example",
            accessibleLabel: "Example home",
          },
          brandVersion: "1.0.0",
          brandUpdateVersion: "1.0.1",
          brandUpdateHref: "/system-health",
          homeHref: "/",
          groups: [],
        }}
      />
    </RouteProvider>,
  );
  const update = document.querySelector<HTMLAnchorElement>(
    'a[aria-label="Version 1.0.0. Update available: version 1.0.1"]',
  );
  const home = document.querySelector<HTMLAnchorElement>(
    'a[href="/"]:not([tabindex])',
  );
  assert.ok(update && home);
  assert.equal(update.textContent, "v1.0.0");
  assert.ok(update.querySelector('[data-slot="brand-update-indicator"]'));
  assert.equal(update.getAttribute("href"), "/system-health");
  assert.equal(update.parentElement?.closest("a"), null);
  await act(async () => click(update, { ctrlKey: true }));
  assert.deepEqual(routes, []);
  await act(async () => click(update));
  await act(async () => click(home));
  assert.deepEqual(routes, ["/system-health", "/"]);
  await view.unmount();
});

test("primary navigation current-page semantics match sections and preserve descendants", async () => {
  const routes: string[] = [];
  const config = {
    accessibleLabel: "Primary navigation",
    brand: { id: "test", title: "Example", accessibleLabel: "Example home" },
    homeHref: "/",
    groups: [
      {
        id: "settings",
        items: [
          {
            kind: "link" as const,
            id: "account",
            href: "/settings/profile",
            activePath: "/settings",
            preserveSubroute: true,
            label: "Account settings",
          },
          {
            kind: "link" as const,
            id: "team",
            href: "/team/general",
            activePath: "/team",
            preserveSubroute: true,
            label: "Team settings",
          },
          {
            kind: "link" as const,
            id: "external",
            href: "https://example.test/settings",
            activePath: "/settings",
            external: true,
            label: "External settings",
          },
        ],
      },
    ],
  };
  const content = (pathname: string) => (
    <RouteProvider pathname={pathname} navigate={(href) => routes.push(href)}>
      <ApplicationSidebar config={config} />
    </RouteProvider>
  );
  const view = await mount(content("/settings/preferences"));
  const account = document.querySelector<HTMLAnchorElement>(
    'a[href="/settings/profile"]',
  );
  const team = document.querySelector<HTMLAnchorElement>(
    'a[href="/team/general"]',
  );
  const external = document.querySelector<HTMLAnchorElement>(
    'a[href="https://example.test/settings"]',
  );
  assert.ok(account && team && external);
  assert.equal(account.getAttribute("aria-current"), "page");
  assert.equal(team.getAttribute("aria-current"), null);
  assert.equal(external.getAttribute("aria-current"), null);
  await act(async () => click(account));
  assert.deepEqual(routes, []);
  await view.render(content("/team/members"));
  assert.equal(account.getAttribute("aria-current"), null);
  assert.equal(team.getAttribute("aria-current"), "page");
  await act(async () => click(team));
  assert.deepEqual(routes, []);
  for (const pathname of ["/settings-archive", "/teams", "/unrelated"]) {
    await view.render(content(pathname));
    assert.equal(account.getAttribute("aria-current"), null);
    assert.equal(team.getAttribute("aria-current"), null);
    assert.equal(external.getAttribute("aria-current"), null);
  }
  await view.unmount();
});

test("breadcrumb dropdown popovers forward native refs, DOM props, render classes, and selection callbacks", async () => {
  const ref = createRef<HTMLElement>();
  const selections: string[] = [];
  const view = await mount(
    <BreadcrumbDropdown.Root defaultOpen>
      <BreadcrumbDropdown.Trigger>Account</BreadcrumbDropdown.Trigger>
      <BreadcrumbDropdown.Popover
        ref={ref}
        data-testid="account-popover"
        className={() => "account-options"}
      >
        <BreadcrumbDropdown.Menu
          aria-label="Account pages"
          onAction={(key) => selections.push(String(key))}
        >
          <BreadcrumbDropdown.Item id="profile">
            Profile
          </BreadcrumbDropdown.Item>
        </BreadcrumbDropdown.Menu>
      </BreadcrumbDropdown.Popover>
    </BreadcrumbDropdown.Root>,
  );
  try {
    assert.ok(ref.current instanceof HTMLElement);
    assert.equal(ref.current.dataset.testid, "account-popover");
    assert.equal(ref.current.classList.contains("account-options"), true);
    const profile = document.querySelector('[role="menuitem"]');
    assert.ok(profile);
    await act(async () =>
      profile.dispatchEvent(new MouseEvent("click", { bubbles: true })),
    );
    assert.deepEqual(selections, ["profile"]);
  } finally {
    await view.unmount();
  }
});

test("breadcrumb select popovers retain controlled selection and native ref forwarding", async () => {
  const ref = createRef<HTMLElement>();
  const selections: string[] = [];
  const view = await mount(
    <BreadcrumbSelect.Root
      aria-label="Board"
      defaultOpen
      selectedKey="first"
      onSelectionChange={(key) => selections.push(String(key))}
    >
      <BreadcrumbSelect.Trigger>
        <BreadcrumbSelect.Value />
      </BreadcrumbSelect.Trigger>
      <BreadcrumbSelect.Popover ref={ref} data-testid="board-popover">
        <ListBox>
          <ListBox.Item id="first">First board</ListBox.Item>
          <ListBox.Item id="second">Second board</ListBox.Item>
        </ListBox>
      </BreadcrumbSelect.Popover>
    </BreadcrumbSelect.Root>,
  );
  try {
    assert.ok(ref.current instanceof HTMLElement);
    assert.equal(ref.current.dataset.testid, "board-popover");
    const second = [...document.querySelectorAll('[role="option"]')].find(
      (item) => item.textContent === "Second board",
    );
    assert.ok(second);
    await act(async () =>
      second.dispatchEvent(new MouseEvent("click", { bubbles: true })),
    );
    assert.deepEqual(selections, ["second"]);
  } finally {
    await view.unmount();
  }
});
