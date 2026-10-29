import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AuthPreview,
  authPreviewBrand,
  previewProvider,
} from "../../../studio/auth-previews";
import { AccessDenied } from "../../../src/patterns/auth/access-denied";

const meta = {
  title: "Patterns/Auth/AccessDenied",
  component: AccessDenied,
  parameters: {
    docs: {
      description: {
        component:
          "Use the published AccessDenied component from @avgeek-oss/design-system/patterns/auth/access-denied when the identity provider has not given the person this app, their role was removed (suspended), or they were deactivated. accessDeniedStatus maps a sign_in_denied redirect error to the status. Access is granted in the provider, never in the app.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <AuthPreview initial="AccessDenied" />,
};

export const Suspended: Story = {
  name: "Suspended",
  render: () => (
    <AccessDenied
      brand={authPreviewBrand}
      productName="Avgeek"
      providerName={previewProvider}
      status="suspended"
      email="ada@avgeek.dev"
      onTryAgain={() => {}}
    />
  ),
};

export const Inactive: Story = {
  name: "Inactive",
  render: () => (
    <AccessDenied
      brand={authPreviewBrand}
      productName="Avgeek"
      providerName={previewProvider}
      status="inactive"
    />
  ),
};
