import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConnectedSignIn } from "../../../../src/patterns/auth/connected";
import { ConnectedSignInPreview } from "../../../../studio/connected-previews";

const meta = {
  title: "Patterns/Auth/Connected/ConnectedSignIn",
  component: ConnectedSignIn,
  parameters: {
    docs: {
      description: {
        component:
          "ConnectedSignIn from @avgeek-oss/design-system/patterns/auth/connected takes an AuthClient from @avgeek-oss/auth-client. It reads the callback's ?auth_error=, shows an access denial on AccessDenied and other failures on SignIn, removes the error from the URL, and starts sign-in coming back to ?returnTo=. The example runs against an in-memory fake client.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <ConnectedSignInPreview />,
};
