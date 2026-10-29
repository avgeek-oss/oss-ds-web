import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConnectedApiKeysSettings } from "../../../../src/patterns/auth/connected";
import { ConnectedApiKeysPreview } from "../../../../studio/connected-previews";

const meta = {
  title: "Patterns/Auth/Connected/ConnectedApiKeysSettings",
  component: ConnectedApiKeysSettings,
  parameters: {
    docs: {
      description: {
        component:
          "ConnectedApiKeysSettings from @avgeek-oss/design-system/patterns/auth/connected lists, creates, rotates and revokes the person's API keys. Role ceilings are offered up to the person's role; an admin key needs a recent sign-in, so the dialog steps up and the key is created when they come back. Revocation removes the row at once and restores it if the request fails. The example runs against an in-memory fake client.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <ConnectedApiKeysPreview />,
};

export const Workspaces: Story = {
  name: "Workspaces",
  render: () => <ConnectedApiKeysPreview workspaces />,
};

export const LoadFailure: Story = {
  name: "Load failure",
  render: () => <ConnectedApiKeysPreview failLists />,
};
