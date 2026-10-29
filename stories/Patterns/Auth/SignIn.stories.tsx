import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AuthPreview,
  authPreviewBrand,
  previewProvider,
} from "../../../studio/auth-previews";
import { SignIn } from "../../../src/patterns/auth/sign-in";
import { AuthPage } from "../../../src/patterns/pages/page";
import { toast } from "../../../src/overlays/toast";

const meta = {
  title: "Patterns/Auth/SignIn",
  component: SignIn,
  parameters: {
    docs: {
      description: {
        component:
          "Use the published SignIn component from @avgeek-oss/design-system/patterns/auth/sign-in. Sign-in is SSO only: one button sends the person to the organisation's identity provider. Pass the callback's redirect error to show why the last attempt failed. Applications own the sign-in URL and returnTo.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <AuthPreview initial="SignIn" />,
};

export const PageLayout: Story = {
  name: "Page layout",
  render: () => (
    <AuthPage>
      <AuthPreview initial="SignIn" />
    </AuthPage>
  ),
};

export const RedirectError: Story = {
  name: "Redirect error",
  render: () => (
    <SignIn
      brand={authPreviewBrand}
      productName="Avgeek"
      providerName={previewProvider}
      error={{ code: "step_up_failed", reason: "mfa_missing" }}
      onContinue={() => toast.info("Preview: continue to authentik")}
    />
  ),
};

export const ProviderUnavailable: Story = {
  name: "Provider unavailable",
  render: () => (
    <SignIn
      brand={authPreviewBrand}
      productName="Avgeek"
      providerName={previewProvider}
      error={{ code: "oidc_unavailable", reason: null }}
      onContinue={() => toast.info("Preview: continue to authentik")}
    />
  ),
};

export const Pending: Story = {
  name: "Pending",
  render: () => (
    <SignIn
      brand={authPreviewBrand}
      productName="Avgeek"
      providerName={previewProvider}
      isPending
      onContinue={() => {}}
    />
  ),
};
