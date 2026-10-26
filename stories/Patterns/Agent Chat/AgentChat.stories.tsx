import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";
import {
  DashboardCircleIcon,
  Rocket01Icon,
  ServerStack01Icon,
} from "@hugeicons/core-free-icons";
import { AgentChat } from "../../../src/patterns/agent-chat/agent-chat";
import { AgentChatTrigger } from "../../../src/patterns/agent-chat/agent-chat-trigger";
import { AppLayout } from "../../../src/navigation/app-layout";
import {
  AppShell,
  ApplicationNavbar,
  ApplicationSidebar,
} from "../../../src/layouts/app-shell";
import { ApplicationPage } from "../../../src/patterns/pages/page";
import { ResourceTable } from "../../../src/patterns/resource-table";
import { Chip } from "../../../src/data-display/chip";
import { RouteProvider } from "../../../src/hooks/route-context";
import { AvgeekLogo } from "../../../studio/avgeek-brand";
import {
  approvalConversation,
  approvalPending,
  completedConversation,
  describeServiceTool,
  sampleConversations,
  serviceSuggestions,
  useSimulatedAgent,
} from "../../../studio/agent-chat-previews";

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="p-4">
      <div className="mx-auto h-[40rem] max-w-md overflow-hidden rounded-2xl border border-separator">
        {children}
      </div>
    </div>
  );
}

function SimulatedChat({
  initial,
  withHistory = false,
}: {
  initial?: Parameters<typeof useSimulatedAgent>[0];
  withHistory?: boolean;
}) {
  const agent = useSimulatedAgent(initial);
  const [active, setActive] = useState<string | null>("c1");
  const [conversations, setConversations] = useState(sampleConversations);
  return (
    <AgentChat
      productName="Avgeek"
      {...agent.state}
      onSend={agent.send}
      onDecide={agent.decide}
      onStop={agent.stop}
      onNewConversation={agent.reset}
      onClose={() => undefined}
      describeTool={describeServiceTool}
      suggestions={serviceSuggestions}
      {...(withHistory
        ? {
            conversations,
            activeConversationId: active,
            onSelectConversation: setActive,
            onDeleteConversation: async (id: string) =>
              setConversations((items) => items.filter((c) => c.id !== id)),
          }
        : {})}
    />
  );
}

type Service = { name: string; status: "Healthy" | "Stalled"; p95: string };
const services: Service[] = [
  { name: "api", status: "Healthy", p95: "142 ms" },
  { name: "billing-worker", status: "Stalled", p95: "—" },
  { name: "search-api", status: "Healthy", p95: "210 ms" },
];

function ShellPreview() {
  const [open, setOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const agent = useSimulatedAgent({
    items: approvalConversation,
    pending: approvalPending,
    status: "awaiting_confirmation",
  });
  const brand = {
    id: "fixture",
    title: "Avgeek",
    accessibleLabel: "Avgeek home",
    logo: <AvgeekLogo />,
  };
  return (
    <RouteProvider pathname="/services" navigate={() => undefined}>
      <AppShell
        policy={{ kind: "product", toasts: false }}
        contentWidth="broad"
      >
        <AppLayout
          sidebarOpen={sidebarOpen}
          onSidebarOpenChange={setSidebarOpen}
          asideOpen={open}
          onAsideOpenChange={setOpen}
          aside={
            <AgentChat
              productName="Avgeek"
              {...agent.state}
              onSend={agent.send}
              onDecide={agent.decide}
              onStop={agent.stop}
              onNewConversation={agent.reset}
              onClose={() => setOpen(false)}
              describeTool={describeServiceTool}
              suggestions={serviceSuggestions}
            />
          }
          sidebar={
            <ApplicationSidebar
              config={{
                accessibleLabel: "Primary navigation",
                brand,
                homeHref: "/overview",
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
                      {
                        kind: "link",
                        id: "services",
                        href: "/services",
                        label: "Services",
                        icon: ServerStack01Icon,
                      },
                      {
                        kind: "link",
                        id: "deployments",
                        href: "/deployments",
                        label: "Deployments",
                        icon: Rocket01Icon,
                      },
                    ],
                  },
                ],
              }}
            />
          }
          navbar={
            <ApplicationNavbar
              config={{ brand, homeHref: "/overview" }}
              hasSidebar
              sidebarOpen={sidebarOpen}
              onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
              showThemeSwitcher
              actions={
                <AgentChatTrigger
                  isOpen={open}
                  onOpenChange={setOpen}
                  needsAttention={agent.state.pending.length > 0}
                />
              }
            />
          }
        >
          <AppShell.Content>
            <ApplicationPage title="Services" breadcrumbAncestors={[]}>
              <ResourceTable<Service>
                ariaLabel="Services"
                emptyTitle="No services"
                emptyDescription="Deploy a service to see it here."
                getRowKey={(item) => item.name}
                items={services}
                columns={[
                  {
                    key: "name",
                    header: "Service",
                    isRowHeader: true,
                    cell: (item) => item.name,
                  },
                  {
                    key: "status",
                    header: "Status",
                    cell: (item) => (
                      <Chip
                        color={
                          item.status === "Healthy" ? "success" : "warning"
                        }
                        size="sm"
                      >
                        {item.status}
                      </Chip>
                    ),
                  },
                  {
                    key: "p95",
                    header: "p95 latency",
                    cell: (item) => item.p95,
                  },
                ]}
              />
            </ApplicationPage>
          </AppShell.Content>
        </AppLayout>
      </AppShell>
    </RouteProvider>
  );
}

const meta = {
  title: "Patterns/Agent Chat/AgentChat",
  parameters: {
    docs: {
      description: {
        component:
          "Use the published AgentChat component from @avgeek-oss/design-system/patterns/agent-chat/agent-chat inside AppLayout's aside. The examples use the actual export with a scripted agent; applications pass state and callbacks from useAgentChat in @avgeek-oss/agent-react and own tools, permissions and persistence.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => (
    <Frame>
      <SimulatedChat />
    </Frame>
  ),
};

export const Conversation: Story = {
  render: () => (
    <Frame>
      <SimulatedChat initial={{ items: completedConversation }} />
    </Frame>
  ),
};

export const AwaitingApproval: Story = {
  render: () => (
    <Frame>
      <SimulatedChat
        initial={{
          items: approvalConversation,
          pending: approvalPending,
          status: "awaiting_confirmation",
        }}
      />
    </Frame>
  ),
};

export const Working: Story = {
  render: () => (
    <Frame>
      <SimulatedChat
        initial={{
          items: completedConversation
            .slice(0, 2)
            .map((item) =>
              item.type === "tool_call" ? { ...item, status: "pending" } : item,
            ),
          status: "streaming",
          thinking: "Comparing failed deployments with health check history…",
        }}
      />
    </Frame>
  ),
};

export const Failed: Story = {
  render: () => (
    <Frame>
      <SimulatedChat
        initial={{
          items: completedConversation.slice(0, 1),
          status: "error",
          error: {
            message:
              "The model provider is busy or unreachable. Try again shortly.",
            retryable: true,
          },
        }}
      />
    </Frame>
  ),
};

export const History: Story = {
  render: () => (
    <Frame>
      <SimulatedChat initial={{ items: completedConversation }} withHistory />
    </Frame>
  ),
};

export const InApplicationShell: Story = {
  render: () => <ShellPreview />,
};
