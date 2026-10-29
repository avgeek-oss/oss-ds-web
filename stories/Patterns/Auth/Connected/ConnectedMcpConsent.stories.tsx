import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConnectedMcpConsent } from "../../../../src/patterns/auth/connected";
import { ConnectedConsentPreview } from "../../../../studio/connected-previews";

const meta = {
  title: "Patterns/Auth/Connected/ConnectedMcpConsent",
  component: ConnectedMcpConsent,
  parameters: {
    docs: {
      description: {
        component:
          "ConnectedMcpConsent from @avgeek-oss/design-system/patterns/auth/connected loads the consent request from ?request=, signs the person in first if needed, and sends the decision with the chosen role ceiling. An admin ceiling needs a recent sign-in: the step-up dialog sends the person to the provider and the approval finishes when they come back. The example runs against an in-memory fake client.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <ConnectedConsentPreview />,
};

export const StepUp: Story = {
  name: "Step-up",
  render: () => <ConnectedConsentPreview stepUp />,
};

export const Expired: Story = {
  name: "Expired",
  render: () => <ConnectedConsentPreview missing />,
};
