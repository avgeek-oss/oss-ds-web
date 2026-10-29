import type { Meta, StoryObj } from "@storybook/react-vite";
import { WorkspaceMembersSettings } from "../../../src/patterns/team-settings/workspace-members-settings";
import { WorkspaceMembersPreview } from "../../../studio/pattern-previews";

const meta = {
  title: "Patterns/Team Settings/WorkspaceMembersSettings",
  component: WorkspaceMembersSettings,
  parameters: {
    docs: {
      description: {
        component:
          "Use the published WorkspaceMembersSettings component from @avgeek-oss/design-system/patterns/team-settings/workspace-members-settings for apps with workspaces. Workspace membership is the app's own; adding and removing people here never changes their role, which stays in the identity provider.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <WorkspaceMembersPreview />,
};
