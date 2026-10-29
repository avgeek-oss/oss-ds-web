import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { McpConnectionsSettings } from "../../../src/patterns/account-settings/mcp-connections-settings.js";
import { SettingsPageTitle } from "../../../src/patterns/settings/page-title.js";
import type { AuthorizedClient } from "../../../src/patterns/account-settings/api-keys-table.js";
function Fixture() {
  const [items, setItems] = useState<AuthorizedClient[]>([
    {
      id: "codex",
      clientId: "https://chatgpt.com/oauth/codex/YddBjjAsi-xR/client.json",
      clientName: "https://chatgpt.com/oauth/codex/YddBjjAsi-xR/client.json",
      logoUri: null,
      ceiling: "admin",
      resources: ["https://api.example.test/mcp"],
      restrictions: null,
      createdAt: "2026-10-01T12:00:00Z",
      lastUsedAt: null,
    },
    {
      id: "client",
      clientId: "example.test",
      clientName: "Example app",
      logoUri: null,
      ceiling: "viewer",
      resources: ["https://api.example.test/mcp"],
      restrictions: null,
      createdAt: "2026-10-01T12:00:00Z",
      lastUsedAt: "2026-10-05T12:00:00Z",
    },
  ]);

  return (
    <div className="grid gap-6">
      <h1>
        <SettingsPageTitle section="mcp-connections" />
      </h1>
      <McpConnectionsSettings
        items={items}
        formatDate={(value) => new Date(value).toLocaleDateString("en")}
        onRevoke={async (id) => {
          setItems((previous) => previous.filter((item) => item.id !== id));
        }}
      />
    </div>
  );
}

const meta = {
  title: "Patterns/Account Settings/McpConnectionsSettings",
  parameters: {
    docs: {
      description: {
        component:
          "Interactive McpConnectionsSettings examples using the shared exports. Applications own routing, permissions and persistence.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = { name: "Master", render: () => <Fixture /> };
