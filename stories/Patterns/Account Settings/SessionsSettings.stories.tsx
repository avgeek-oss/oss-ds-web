import type { Meta, StoryObj } from "@storybook/react-vite";
import { SessionsSettingsPreview as ComponentExample } from "../../../studio/account-settings-previews";
import { SessionsSettings } from "../../../src/patterns/account-settings/sessions-settings";
const meta = {
  args: { failRequest: false, slowResponse: false },
  argTypes: {
    failRequest: {
      control: "boolean",
      description: "Simulate a failed request and retain the editable draft.",
    },
    slowResponse: {
      control: "boolean",
      description: "Simulate a pending request.",
    },
  },
  title: "Patterns/Account Settings/SessionsSettings",
  component: SessionsSettings,
  parameters: {
    docs: {
      description: {
        component:
          "Use the published SessionsSettings component from @avgeek-oss/design-system/patterns/account-settings/sessions-settings: signed-in browsers and devices, signing one out, and signing out everywhere. Applications supply data and action callbacks; omit the ones the backend cannot do.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;
export const Master: Story = { render: () => <ComponentExample /> };
export const WithoutSignOutEverywhere: Story = {
  name: "Without sign out everywhere",
  render: () => <ComponentExample everywhere={false} />,
};
