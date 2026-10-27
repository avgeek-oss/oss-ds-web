import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Task01Icon, MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AppShell } from "../../src/layouts/app-shell";
import {
  ApplicationPage,
  ContentPage,
  StatusPage,
} from "../../src/patterns/pages/page";
import { Button } from "../../src/buttons/button";
import { Chip } from "../../src/data-display/chip";
import { TooltipText } from "../../src/overlays/tooltip";

const title =
  "Review the complete release plan, board activity, security access and all remaining product follow-ups";

function PageHeading({
  custom = false,
  wrap = false,
  kind = "application",
}: {
  custom?: boolean;
  wrap?: boolean;
  kind?: "application" | "content" | "status";
}) {
  const [created, setCreated] = useState(0);
  const [opened, setOpened] = useState(0);
  const Page =
    kind === "content"
      ? ContentPage
      : kind === "status"
        ? StatusPage
        : ApplicationPage;
  return (
    <AppShell policy={{ kind: "product", toasts: false }} contentWidth="full">
      <AppShell.Content>
        <Page
          title={title}
          titleOverflow={wrap ? undefined : "truncate"}
          breadcrumbAncestors={[{ label: "Boards", href: "/boards" }]}
          badge={<Chip size="sm">Beta</Chip>}
          titleContent={
            custom ? (
              <span className="inline-flex min-w-0 items-center gap-2">
                <HugeiconsIcon
                  aria-hidden="true"
                  className="size-[19px] shrink-0"
                  icon={Task01Icon}
                  strokeWidth={1.5}
                />
                <TooltipText
                  className="min-w-0 truncate"
                  tooltip={title}
                  openOnPress
                >
                  {title}
                </TooltipText>
              </span>
            ) : undefined
          }
          actions={
            <>
              <Button size="sm" onPress={() => setCreated(created + 1)}>
                New task
              </Button>
              <Button
                size="sm"
                variant="secondary"
                isIconOnly
                aria-label="More actions"
                onPress={() => setOpened(opened + 1)}
              >
                <HugeiconsIcon
                  aria-hidden="true"
                  className="size-4"
                  icon={MoreHorizontalIcon}
                  strokeWidth={1.5}
                />
              </Button>
            </>
          }
        >
          <p className="text-sm">
            Created: {created}; actions opened: {opened}
          </p>
        </Page>
      </AppShell.Content>
    </AppShell>
  );
}

const meta = {
  title: "Layouts/PageHeading",
  parameters: {
    docs: {
      description: {
        component:
          "Interactive PageHeading examples using the shared exports. Applications own routing, permissions and persistence.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = { name: "Master", render: () => <PageHeading /> };

export const CustomIconTitle: Story = {
  name: "Custom icon title",
  render: () => <PageHeading custom />,
};

export const ContentTitle: Story = {
  name: "Content title",
  render: () => <PageHeading kind="content" />,
};

export const StatusTitle: Story = {
  name: "Status title",
  render: () => <PageHeading kind="status" />,
};

export const DefaultWrapping: Story = {
  name: "Default wrapping",
  render: () => <PageHeading wrap />,
};
