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
          "ConnectedAccountSettings from @avgeek-oss/design-system/patterns/auth/connected shows the read-only profile from the session and this browser's session with Sign out, which goes on to the provider's logout URL. The auth client does not list other sessions yet, so there is no device list or Sign out everywhere. The example runs against an in-memory fake client.",
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
