import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProfileSettings } from "../../../src/patterns/account-settings/profile-settings";
import { ProfileSettingsPreview } from "../../../studio/account-settings-previews";

const meta = {
  title: "Patterns/Account Settings/ProfileSettings",
  component: ProfileSettings,
  parameters: {
    docs: {
      description: {
        component:
          "Use the published ProfileSettings component from @avgeek-oss/design-system/patterns/account-settings/profile-settings. The profile is read-only: name, email and role come from the organisation's identity provider and are changed there.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <ProfileSettingsPreview />,
};

export const WithoutName: Story = {
  name: "Without name",
  render: () => (
    <div className="max-w-lg p-4">
      <ProfileSettings
        name={null}
        email="kim@example.test"
        providerName="authentik"
      />
    </div>
  ),
};
