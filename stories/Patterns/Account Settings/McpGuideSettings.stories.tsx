import type { Meta, StoryObj } from "@storybook/react-vite";
import { McpGuideSettings } from "../../../src/patterns/account-settings/mcp-guide-settings.js";
import { mcpClientConfigurations } from "../../../src/utilities/mcp-client-presentation.js";

const meta = {
  title: "Patterns/Account Settings/McpGuideSettings",
  parameters: {
    docs: {
      description: {
        component:
          "Interactive McpGuideSettings examples using the shared exports. Applications own routing, permissions and persistence.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => (
    <McpGuideSettings
      configurations={mcpClientConfigurations({
        serverName: "example",
        url: "https://example.test/mcp",
      })}
      documentationUrl="https://example.test/docs/mcp"
    />
  ),
};
