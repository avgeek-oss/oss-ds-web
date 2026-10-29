import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConnectedAccountSettings } from "../../../../src/patterns/auth/connected";
import { ConnectedAccountPreview } from "../../../../studio/connected-previews";

const meta = {
  title: "Patterns/Auth/Connected/ConnectedAccountSettings",
  component: ConnectedAccountSettings,
  parameters: {
    docs: {
      description: {
        component:
          "ConnectedAccountSettings from @avgeek-oss/design-system/patterns/auth/connected shows the read-only profile from the session and the person's browser sessions from client.sessions, with the browser and operating system, This device on the current one, Sign out for each and Sign out everywhere. Ending this browser's session goes on to the provider's logout URL. The example runs against an in-memory fake client.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <ConnectedAccountPreview />,
};

export const SessionsLoadFailure: Story = {
  name: "Sessions load failure",
  render: () => <ConnectedAccountPreview failLists />,
};
