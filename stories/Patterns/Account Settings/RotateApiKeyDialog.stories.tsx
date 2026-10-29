import type { Meta, StoryObj } from "@storybook/react-vite";
import { RotateApiKeyDialog } from "../../../src/patterns/account-settings/rotate-api-key-dialog";
import { RotateApiKeyPreview } from "../../../studio/pattern-previews";

const meta = {
  title: "Patterns/Account Settings/RotateApiKeyDialog",
  component: RotateApiKeyDialog,
  parameters: {
    docs: {
      description: {
        component:
          "Use the published RotateApiKeyDialog component from @avgeek-oss/design-system/patterns/account-settings/rotate-api-key-dialog. It replaces a key with one of the same name, role and workspace, keeps the old key working for the chosen grace period, and shows the new secret once. ApiKeysSettings opens it from a key's Rotate action.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <RotateApiKeyPreview />,
};
