import { useState } from "react";
import { Task01Icon, UserAccountIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "../src/buttons/button";
import { Chip } from "../src/data-display/chip";
import { Label } from "../src/forms/label";
import { Switch } from "../src/forms/switch";
import { RouteProvider } from "../src/hooks/route-context";
import {
  AppShell,
  ApplicationNavbar,
  ApplicationSidebar,
  usePersistentAppSidebar,
} from "../src/layouts/app-shell";
import { AppLayout } from "../src/navigation/app-layout";
import {
  SecondaryEntityHeader,
  SecondaryItems,
  SecondarySection,
  SecondarySidebarLayout,
} from "../src/navigation/secondary-sidebar";
import { WorkspaceSelector } from "../src/navigation/workspace-selector";
import { ChoiceField } from "../src/patterns/choice-field";
import { HistoryFilter } from "../src/patterns/history/history-filter";
import { ApplicationPage } from "../src/patterns/pages/page";
import { ResourceTable } from "../src/patterns/resource-table";
import { AvgeekLogo } from "./avgeek-brand";

const brand = {
  id: "sidebar-filters",
  title: "Avgeek",
  accessibleLabel: "Avgeek home",
  logo: <AvgeekLogo />,
};
const statusLabels = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};
const assignees = {
  alex: "Alex Morgan",
  sam: "Sam Rivera",
  jordan: "Jordan Lee (Platform engineering)",
};
type Task = {
  id: string;
  createdAt: string;
  title: string;
  status: keyof typeof statusLabels;
  assignee: keyof typeof assignees;
  archived?: boolean;
};
const tasks: Task[] = [
  {
    id: "1",
    createdAt: "2026-10-27",
    title: "Review sidebar spacing",
    status: "in_progress",
    assignee: "alex",
  },
  {
    id: "2",
    createdAt: "2026-10-26",
    title: "Update API documentation",
    status: "todo",
    assignee: "sam",
  },
  {
    id: "3",
    createdAt: "2026-10-25",
    title: "Add keyboard shortcuts",
    status: "todo",
    assignee: "alex",
  },
  {
    id: "4",
    createdAt: "2026-10-24",
    title: "Publish release notes",
    status: "done",
    assignee: "jordan",
  },
  {
    id: "5",
    createdAt: "2026-10-23",
    title: "Audit workspace access",
    status: "in_progress",
    assignee: "sam",
  },
  {
    id: "6",
    createdAt: "2026-10-22",
    title: "Retire the old dashboard",
    status: "done",
    assignee: "alex",
    archived: true,
  },
];

export function SidebarFiltersPreview() {
  const [pathname, setPathname] = useState("/tasks");
  const { sidebarOpen, onSidebarOpenChange } = usePersistentAppSidebar(
    "oss-ds-filter-fixture-sidebar",
  );
  const [workspace, setWorkspace] = useState("default");
  const [status, setStatus] = useState("");
  const [assignee, setAssignee] = useState("");
  const [sort, setSort] = useState("newest");
  const [includeArchived, setIncludeArchived] = useState(false);
  const mine = pathname === "/tasks/mine";
  const title = mine ? "Assigned to me" : "All tasks";
  const filteredTasks = tasks
    .filter(
      (task) =>
        (!mine || task.assignee === "alex") &&
        (!status || task.status === status) &&
        (!assignee || task.assignee === assignee) &&
        (includeArchived || !task.archived),
    )
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title)
        : b.createdAt.localeCompare(a.createdAt),
    );
  const hasFilters = Boolean(
    status || assignee || sort !== "newest" || includeArchived,
  );
  const resetFilters = () => {
    setStatus("");
    setAssignee("");
    setSort("newest");
    setIncludeArchived(false);
  };

  return (
    <RouteProvider pathname={pathname} navigate={setPathname}>
      <AppShell
        policy={{ kind: "product", toasts: false }}
        contentWidth="broad"
      >
        <AppLayout
          sidebarOpen={sidebarOpen}
          onSidebarOpenChange={onSidebarOpenChange}
          sidebar={
            <ApplicationSidebar
              config={{
                accessibleLabel: "Primary navigation",
                brand,
                brandVersion: "preview",
                homeHref: "/tasks",
                workspace: (
                  <WorkspaceSelector
                    items={[
                      { id: "default", name: "Default" },
                      { id: "design", name: "Design" },
                    ]}
                    selectedKey={workspace}
                    onSelectionChange={setWorkspace}
                  />
                ),
                groups: [
                  {
                    id: "work",
                    label: "Work",
                    items: [
                      {
                        id: "tasks",
                        kind: "link",
                        href: "/tasks",
                        activePath: "/tasks",
                        preserveSubroute: true,
                        label: "Tasks",
                        icon: Task01Icon,
                      },
                    ],
                  },
                ],
              }}
            />
          }
          navbar={
            <ApplicationNavbar
              config={{ brand, homeHref: "/tasks" }}
              hasSidebar
              sidebarOpen={sidebarOpen}
              onSidebarToggle={() => onSidebarOpenChange(!sidebarOpen)}
              showThemeSwitcher
            />
          }
        >
          <SecondarySidebarLayout>
            <SecondaryEntityHeader
              title="Tasks"
              icon={<HugeiconsIcon icon={Task01Icon} aria-hidden="true" />}
            >
              Tasks
            </SecondaryEntityHeader>
            <SecondaryItems
              title="Views"
              selected={mine ? "mine" : "all"}
              items={[
                {
                  id: "all",
                  href: "/tasks",
                  label: "All tasks",
                  icon: <HugeiconsIcon icon={Task01Icon} aria-hidden="true" />,
                },
                {
                  id: "mine",
                  href: "/tasks/mine",
                  label: "Assigned to me",
                  icon: (
                    <HugeiconsIcon icon={UserAccountIcon} aria-hidden="true" />
                  ),
                },
              ]}
            />
            <SecondarySection title="Filters">
              <div className="grid gap-3">
                <HistoryFilter
                  label="Status"
                  value={status}
                  onChange={setStatus}
                  options={Object.entries(statusLabels).map(([id, label]) => ({
                    id,
                    label,
                  }))}
                />
                <HistoryFilter
                  label="Assignee"
                  value={assignee}
                  onChange={setAssignee}
                  searchPlaceholder="Search assignees…"
                  options={Object.entries(assignees).map(([id, label]) => ({
                    id,
                    label,
                  }))}
                />
              </div>
            </SecondarySection>
            <SecondarySection title="Sort">
              <ChoiceField
                label="Sort order"
                value={sort}
                onChange={setSort}
                options={[
                  { id: "newest", label: "Newest first" },
                  { id: "title", label: "Title" },
                ]}
              />
            </SecondarySection>
            <SecondarySection title="Display">
              <Switch
                isSelected={includeArchived}
                onChange={setIncludeArchived}
              >
                <Switch.Content>
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                  <Label>Include archived</Label>
                </Switch.Content>
              </Switch>
            </SecondarySection>
            <SecondarySection>
              <Button
                variant="secondary"
                isDisabled={!hasFilters}
                onPress={resetFilters}
              >
                Reset filters
              </Button>
            </SecondarySection>
            <AppShell.Content>
              <ApplicationPage
                title={title}
                titleContent={
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <HugeiconsIcon
                      aria-hidden="true"
                      className="size-[19px] shrink-0"
                      icon={mine ? UserAccountIcon : Task01Icon}
                    />
                    <span>{title}</span>
                  </span>
                }
                badge={
                  <output
                    aria-live="polite"
                    aria-label="Matching tasks"
                    className="text-xs font-normal text-muted"
                  >
                    {filteredTasks.length}{" "}
                    {filteredTasks.length === 1 ? "task" : "tasks"}
                  </output>
                }
                breadcrumbAncestors={[]}
              >
                <ResourceTable
                  ariaLabel="Tasks"
                  items={filteredTasks}
                  getRowKey={(task) => task.id}
                  columns={[
                    {
                      key: "title",
                      header: "Task",
                      cell: (task) => task.title,
                    },
                    {
                      key: "status",
                      header: "Status",
                      cell: (task) => (
                        <Chip
                          size="sm"
                          color={task.status === "done" ? "success" : "default"}
                        >
                          {statusLabels[task.status]}
                        </Chip>
                      ),
                    },
                    {
                      key: "assignee",
                      header: "Assignee",
                      cell: (task) => assignees[task.assignee],
                    },
                  ]}
                  mobileLayout="stacked"
                  emptyTitle="No tasks match these filters"
                  emptyDescription="Try another status or assignee, or reset the filters."
                  emptyAction={
                    <Button variant="secondary" onPress={resetFilters}>
                      Reset filters
                    </Button>
                  }
                />
              </ApplicationPage>
            </AppShell.Content>
          </SecondarySidebarLayout>
        </AppLayout>
      </AppShell>
    </RouteProvider>
  );
}
