import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConnectedMcpConnections } from "../../../../src/patterns/auth/connected";
import { ConnectedMcpConnectionsPreview } from "../../../../studio/connected-previews";

const meta = {
  title: "Patterns/Auth/Connected/ConnectedMcpConnections",
  component: ConnectedMcpConnections,
  parameters: {
    docs: {
      description: {
        component:
          "ConnectedMcpConnections from @avgeek-oss/design-system/patterns/auth/connected lists the MCP clients the person connected, with their role ceiling and last use, and disconnects them. The example runs against an in-memory fake client.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <ConnectedMcpConnectionsPreview />,
};

export const DisconnectFailure: Story = {
  name: "Disconnect failure",
  render: () => <ConnectedMcpConnectionsPreview failChanges />,
};
