import type { Meta, StoryObj } from "@storybook/react-vite";
import { PreferencesSettingsPreview } from "../../studio/account-settings-previews";
import { AvgeekLogo } from "../../studio/avgeek-brand";
import { SidebarFiltersPreview } from "../../studio/sidebar-filters-preview";
import { useState } from "react";
import {
  DashboardCircleIcon,
  Notification02Icon,
  UserAccountIcon,
  UserGroupIcon,
  Settings01Icon,
  Key01Icon,
  ComputerIcon,
  SourceCodeIcon,
  MoreHorizontalIcon,
  Rocket01Icon,
  Alert02Icon,
  BookOpen01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AppShell,
  ApplicationNavbar,
  ApplicationSidebar,
  usePersistentAppSidebar,
} from "../../src/layouts/app-shell";
import { AppLayout } from "../../src/navigation/app-layout";
import { WorkspaceSelector } from "../../src/navigation/workspace-selector";
import { RouteProvider } from "../../src/hooks/route-context";
import {
  SecondarySidebarLayout,
  SecondaryItems,
  SecondaryEntityHeader,
} from "../../src/navigation/secondary-sidebar";
import { ApplicationPage } from "../../src/patterns/pages/page";
import { SidebarAccountMenu } from "../../src/patterns/sidebar-account-menu";
import {
  NotificationMenu,
  type NotificationItem,
} from "../../src/patterns/notifications";
import { NameSettingsForm } from "../../src/patterns/settings/name-form";
import {
  SettingsPageTitle,
  settingsPageLabels,
} from "../../src/patterns/settings/page-title";
import { SessionsTable } from "../../src/patterns/settings/tables";
import { ProfileSettings } from "../../src/patterns/account-settings/profile-settings";
import { Button } from "../../src/buttons/button";
import { Widget } from "../../src/data-display/widget";
import { Chip } from "../../src/data-display/chip";
import { toast } from "../../src/overlays/toast";
const icon = (value: typeof UserAccountIcon) => (
  <HugeiconsIcon aria-hidden icon={value} strokeWidth={1.5} />
);
const brand = {
  id: "fixture",
  title: "Avgeek",
  accessibleLabel: "Avgeek home",
  logo: <AvgeekLogo />,
};
const account = [
  {
    title: "Account",
    items: [
      { id: "profile", label: "Profile", icon: icon(UserAccountIcon) },
      { id: "preferences", label: "Preferences", icon: icon(Settings01Icon) },
    ],
  },
  {
    title: "Security",
    items: [{ id: "sessions", label: "Sessions", icon: icon(ComputerIcon) }],
  },
  {
    title: "API & MCP",
    items: [
      { id: "api-keys", label: "API Keys", icon: icon(Key01Icon) },
      { id: "mcp", label: "MCP Guide", icon: icon(SourceCodeIcon) },
    ],
  },
] as const;
function Shell({
  initial = "/settings/profile",
  updateAvailable = false,
  withWorkspace = false,
}: {
  initial?: string;
  updateAvailable?: boolean;
  withWorkspace?: boolean;
}) {
  const [pathname, setPathname] = useState(initial);
  const { sidebarOpen: open, onSidebarOpenChange: setOpen } =
    usePersistentAppSidebar("oss-ds-fixture-sidebar");
  const name = "Alex Taylor";
  const [teamName, setTeamName] = useState("Avgeek");
  const [workspace, setWorkspace] = useState("default");
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "deploy",
      title: "Deployment completed",
      message: "Website is running.",
      href: "/overview",
      icon: icon(Rocket01Icon),
      time: "2m ago",
      unread: true,
    },
    {
      id: "incident",
      title: "Service needs attention",
      message: "The last health check failed.",
      href: "/notifications",
      icon: <span className="text-danger">{icon(Alert02Icon)}</span>,
      time: "8m ago",
      unread: true,
    },
    {
      id: "invite",
      title: "Invitation accepted",
      href: "/team/members",
      icon: icon(UserGroupIcon),
      time: "1h ago",
      unread: false,
    },
  ]);
  const selected = pathname.split("/").at(-1) ?? "profile";
  const isAccount = pathname.startsWith("/settings/");
  const isTeam = pathname.startsWith("/team");
  const settingsSection = isAccount
    ? (account
        .flatMap((group) => [...group.items])
        .find((item) => item.id === selected)?.id ?? "profile")
    : isTeam
      ? selected === "members"
        ? "members"
        : "general"
      : undefined;
  const title = settingsSection
    ? settingsPageLabels[settingsSection]
    : pathname === "/notifications"
      ? "Notifications"
      : "Overview";
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en", {
      timeZone: "UTC",
      dateStyle: "medium",
    });
  return (
    <RouteProvider pathname={pathname} navigate={setPathname}>
      <AppShell
        policy={{ kind: "product", toasts: false }}
        contentWidth="broad"
      >
        <AppLayout
          sidebarOpen={open}
          onSidebarOpenChange={setOpen}
          toggleShortcut
          sidebar={
            <ApplicationSidebar
              config={{
                accessibleLabel: "Primary navigation",
                brand,
                brandVersion: "preview",
                brandUpdateVersion: updateAvailable ? "next" : undefined,
                brandUpdateHref: "/overview",
                homeHref: "/overview",
                workspace: withWorkspace ? (
                  <WorkspaceSelector
                    items={[
                      { id: "default", name: "Default" },
                      { id: "design", name: "Design" },
                    ]}
                    selectedKey={workspace}
                    onSelectionChange={setWorkspace}
                    onCreate={() => toast.info("Create workspace preview")}
                  />
                ) : undefined,
                groups: [
                  {
                    id: "operate",
                    label: "Operate",
                    items: [
                      {
                        kind: "link",
                        id: "overview",
                        href: "/overview",
                        label: "Overview",
                        icon: DashboardCircleIcon,
                      },
                    ],
                  },
                  {
                    id: "manage",
                    label: "Manage",
                    items: [
                      {
                        kind: "link",
                        id: "notifications",
                        href: "/notifications",
                        label: "Notifications",
                        icon: Notification02Icon,
                      },
                      {
                        kind: "link",
                        id: "incidents",
                        href: "/incidents",
                        label: "Incidents",
                        icon: Alert02Icon,
                        badge: {
                          label: "2 active incidents",
                          value: 2,
                          tone: "danger",
                        },
                      },
                    ],
                  },
                  {
                    id: "settings",
                    label: "Settings",
                    items: [
                      {
                        kind: "link",
                        id: "account",
                        href: "/settings/profile",
                        activePath: "/settings",
                        label: "Account settings",
                        icon: UserAccountIcon,
                        preserveSubroute: true,
                      },
                      {
                        kind: "link",
                        id: "team",
                        href: "/team/general",
                        label: "Team settings",
                        icon: UserGroupIcon,
                        preserveSubroute: true,
                      },
                    ],
                  },
                ],
                footerContent: (
                  <SidebarAccountMenu
                    name={name}
                    email="alex@example.test"
                    teamName={teamName}
                    groups={[
                      {
                        id: "account",
                        label: "Account",
                        items: [
                          {
                            id: "profile",
                            label: "Profile",
                            icon: icon(UserAccountIcon),
                          },
                          {
                            id: "preferences",
                            label: "Preferences",
                            icon: icon(Settings01Icon),
                          },
                          {
                            id: "api-keys",
                            label: "API Keys",
                            icon: icon(Key01Icon),
                          },
                        ],
                      },
                      {
                        id: "app",
                        label: "Avgeek",
                        items: [
                          {
                            id: "documentation",
                            label: "Documentation",
                            icon: icon(BookOpen01Icon),
                          },
                        ],
                      },
                      {
                        id: "session",
                        label: "Session",
                        items: [
                          {
                            id: "logout",
                            label: "Sign out",
                            icon: icon(Logout01Icon),
                            destructive: true,
                          },
                        ],
                      },
                    ]}
                    onAction={(id) => {
                      if (["documentation", "logout"].includes(id))
                        toast.info(
                          `${id === "logout" ? "Sign out" : "Documentation"} preview`,
                        );
                      else setPathname(`/settings/${id}`);
                    }}
                  />
                ),
              }}
            />
          }
          navbar={
            <ApplicationNavbar
              config={{ brand, homeHref: "/overview" }}
              hasSidebar
              sidebarOpen={open}
              onSidebarToggle={() => setOpen(!open)}
              showThemeSwitcher
              actions={
                <NotificationMenu
                  items={notifications}
                  unreadCount={
                    notifications.filter((item) => item.unread).length
                  }
                  onMarkAllRead={() =>
                    setNotifications((items) =>
                      items.map((item) => ({ ...item, unread: false })),
                    )
                  }
                />
              }
            />
          }
        >
          <SecondarySidebarLayout>
            {isAccount || isTeam ? (
              <>
                {!withWorkspace ? (
                  <SecondaryEntityHeader
                    title={isAccount ? "Account settings" : "Team settings"}
                    icon={icon(isAccount ? UserAccountIcon : UserGroupIcon)}
                  >
                    {isAccount ? "Account settings" : "Team settings"}
                  </SecondaryEntityHeader>
                ) : null}
                {(isAccount
                  ? account
                  : [
                      {
                        title: "Team",
                        items: [
                          {
                            id: "general",
                            label: "General",
                            icon: icon(Settings01Icon),
                          },
                          {
                            id: "members",
                            label: "Members",
                            icon: icon(UserGroupIcon),
                          },
                        ],
                      },
                    ]
                ).map((group) => (
                  <SecondaryItems
                    key={group.title}
                    title={group.title}
                    selected={selected}
                    items={group.items.map((item) => ({
                      ...item,
                      href: `/${isAccount ? "settings" : "team"}/${item.id}`,
                    }))}
                  />
                ))}
              </>
            ) : null}
            <AppShell.Content>
              <ApplicationPage
                breadcrumbAncestors={[
                  {
                    label: isAccount
                      ? "Account settings"
                      : isTeam
                        ? "Team settings"
                        : "Avgeek",
                    href: "/overview",
                  },
                ]}
                title={title}
                titleContent={
                  settingsSection ? (
                    <SettingsPageTitle section={settingsSection} />
                  ) : (
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <HugeiconsIcon
                        aria-hidden="true"
                        className="size-[19px] shrink-0"
                        icon={
                          pathname === "/notifications"
                            ? Notification02Icon
                            : DashboardCircleIcon
                        }
                        strokeWidth={1.5}
                      />
                      <span>{title}</span>
                    </span>
                  )
                }
                actions={
                  !isAccount && !isTeam ? (
                    <div className="flex gap-2">
                      <Button onPress={() => toast.info("Deployment preview")}>
                        {icon(Rocket01Icon)}Deploy
                      </Button>
                      <Button
                        variant="secondary"
                        isIconOnly
                        aria-label="More actions"
                        onPress={() => toast.info("More actions preview")}
                      >
                        {icon(MoreHorizontalIcon)}
                      </Button>
                    </div>
                  ) : undefined
                }
              >
                {isAccount && selected === "profile" ? (
                  <ProfileSettings
                    name={name}
                    email="alex@example.test"
                    role="admin"
                    providerName="authentik"
                  />
                ) : isTeam && selected === "general" ? (
                  <NameSettingsForm
                    title="Team details"
                    label="Team name"
                    value={teamName}
                    onSave={async (value) => setTeamName(value)}
                  />
                ) : selected === "preferences" ? (
                  <PreferencesSettingsPreview embedded />
                ) : selected === "sessions" ? (
                  <SessionsTable
                    items={[
                      {
                        id: "current-session",
                        name: "Safari on macOS",
                        current: true,
                        lastActive: "2026-10-05T10:00:00Z",
                        expiresAt: "2026-11-05T10:00:00Z",
                      },
                    ]}
                    formatDate={formatDate}
                    actions={() => (
                      <Button
                        variant="secondary"
                        onPress={() => toast.info("Sign out preview")}
                      >
                        Sign out
                      </Button>
                    )}
                  />
                ) : (
                  <div className="content-grid">
                    <Widget>
                      <Widget.Header>
                        <Widget.Title>
                          {isAccount ? title : "Services"}
                        </Widget.Title>
                      </Widget.Header>
                      <Widget.Content>
                        {isAccount ? (
                          <p className="text-sm text-muted">
                            {title} content uses the shared page layout.
                          </p>
                        ) : (
                          <>
                            <p className="mb-4 font-mono text-3xl font-medium tabular-nums">
                              10
                            </p>
                            <Chip color="success">10 running</Chip>
                          </>
                        )}
                      </Widget.Content>
                    </Widget>
                    <Widget>
                      <Widget.Header>
                        <Widget.Title>Recent activity</Widget.Title>
                      </Widget.Header>
                      <Widget.Content>
                        <p className="text-sm text-muted">No activity yet.</p>
                      </Widget.Content>
                    </Widget>
                  </div>
                )}
              </ApplicationPage>
            </AppShell.Content>
          </SecondarySidebarLayout>
        </AppLayout>
      </AppShell>
    </RouteProvider>
  );
}

const meta = {
  title: "Layouts/Shell",
  parameters: {
    docs: {
      description: {
        component:
          "Interactive Shell examples using the shared exports. Applications own routing, permissions and persistence.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <Shell updateAvailable />,
};

export const AccountSettings: Story = {
  name: "Account settings",
  render: () => <Shell />,
};

export const PageWithoutSecondarySidebar: Story = {
  name: "Page without secondary sidebar",
  render: () => <Shell initial="/overview" />,
};

export const TeamSettings: Story = {
  name: "Team settings",
  render: () => <Shell initial="/team/general" />,
};

export const Workspace: Story = {
  name: "Workspace",
  render: () => <Shell withWorkspace updateAvailable />,
};

export const Filters: Story = {
  name: "Filters",
  render: () => <SidebarFiltersPreview />,
  parameters: {
    docs: {
      description: {
        story:
          "Sidebar categories can contain navigation, filter fields and other controls. Status, searchable assignee, sort order and archive visibility update the task table; selections persist while mobile navigation closes and reopens.",
      },
    },
  },
};
