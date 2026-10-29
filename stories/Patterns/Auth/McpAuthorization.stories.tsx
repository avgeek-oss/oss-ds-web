import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConsentPreview } from "../../../studio/auth-previews";

const meta = {
  args: { authorizationFailure: false, slowAuthorization: false },
  argTypes: {
    viewerRole: { control: "boolean" },
    authorizationFailure: {
      control: "boolean",
      description: "Simulate a failed request and retain the editable draft.",
    },
    slowAuthorization: {
      control: "boolean",
      description: "Simulate a pending request.",
    },
  },
  title: "Patterns/Auth/McpAuthorization",
  parameters: {
    docs: {
      description: {
        component:
          "Interactive McpAuthorization examples using the shared exports: the client, where it returns to, a role ceiling capped at the person's own role, and an optional workspace. Applications own routing, permissions and persistence; ConnectedMcpConsent does the data work.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <ConsentPreview />,
};

export const Viewer: Story = {
  name: "Viewer",
  render: () => <ConsentPreview viewerRole />,
};

export const Pending: Story = {
  args: { slowAuthorization: true },
  name: "Pending",
  render: () => <ConsentPreview slowRequest />,
};

export const Localhost: Story = {
  name: "Localhost",
  render: () => <ConsentPreview localhost />,
};

export const Workspace: Story = {
  name: "Workspace",
  render: () => <ConsentPreview workspaces />,
};

export const LongClientName: Story = {
  name: "Long client name",
  render: () => <ConsentPreview clientName={"M".repeat(100)} />,
};
