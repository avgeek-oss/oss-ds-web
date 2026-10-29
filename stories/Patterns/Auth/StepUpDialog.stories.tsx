import type { Meta, StoryObj } from "@storybook/react-vite";
import { StepUpPreview } from "../../../studio/auth-previews";
import { StepUpDialog } from "../../../src/patterns/auth/step-up-dialog";

const meta = {
  title: "Patterns/Auth/StepUpDialog",
  component: StepUpDialog,
  parameters: {
    docs: {
      description: {
        component:
          "Use the published StepUpDialog component from @avgeek-oss/design-system/patterns/auth/step-up-dialog when an action fails with step_up_required. It explains why, and one button sends the person back through the identity provider (prompt=login and MFA); the app repeats the action when they return.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => (
    <StepUpPreview reason="Deleting a workspace needs a recent sign-in." />
  ),
};

export const Pending: Story = {
  name: "Pending",
  render: () => <StepUpPreview pending />,
};
