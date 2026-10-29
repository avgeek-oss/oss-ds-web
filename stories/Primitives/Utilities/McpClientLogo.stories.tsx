import type { Meta, StoryObj } from "@storybook/react-vite";
import { PrimitivePreview, Variant } from "../../../studio/primitive-preview";
import { McpClientLogo } from "../../../src/utilities/mcp-client-presentation";

const clients = [
  ["codex", "Codex"],
  ["claude", "Claude Code"],
  ["cursor", "Cursor"],
  ["vscode", "VS Code"],
  ["other", "Other clients"],
] as const;

function McpClientLogoVariants({ section = 0 }: { section?: number }) {
  return (
    <PrimitivePreview title="McpClientLogo">
      {section === 0 && (
        <Variant title="Clients">
          {clients.map(([id, label]) => (
            <span key={id} className="inline-flex items-center gap-2 text-sm">
              <McpClientLogo client={id} />
              {label}
            </span>
          ))}
        </Variant>
      )}
      {section === 1 && (
        <Variant title="Larger">
          {clients.map(([id]) => (
            <McpClientLogo key={id} client={id} className="size-5" />
          ))}
        </Variant>
      )}
    </PrimitivePreview>
  );
}

const meta = {
  title: "Primitives/Utilities/McpClientLogo",
  component: McpClientLogo,
  parameters: {
    docs: {
      description: {
        component:
          "Decorative MCP client logos from @avgeek-oss/design-system/utilities/mcp-client-presentation. Unknown client IDs show the generic MCP icon. mcpClientConfigurations supplies the matching McpGuideSettings entries.",
      },
    },
  },
} satisfies Meta<typeof McpClientLogo>;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <McpClientLogoVariants section={0} />,
};

export const Larger: Story = {
  name: "Larger",
  render: () => <McpClientLogoVariants section={1} />,
};
