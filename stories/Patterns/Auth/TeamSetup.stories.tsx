import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef } from "react";
import { AuthPreview, authPreviewBrand } from "../../../studio/auth-previews";
import { preferenceOptions } from "../../../studio/preference-options";
import { TeamSetup } from "../../../src/patterns/auth/team-setup";
import { toast } from "../../../src/overlays/toast";

function RetryExample() {
  const attempts = useRef(0);
  return (
    <TeamSetup
      brand={authPreviewBrand}
      preferenceOptions={preferenceOptions}
      onSubmit={async (values) => {
        attempts.current++;
        await new Promise((resolve) => setTimeout(resolve, 300));
        if (attempts.current === 1)
          throw new Error("Could not save the team. Try again.");
        toast.success(`Setup completed for ${values.team}`);
      }}
    />
  );
}

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
  title: "Patterns/Auth/TeamSetup",
  component: TeamSetup,
  parameters: {
    docs: {
      description: {
        component:
          "Use the published TeamSetup component from @avgeek-oss/design-system/patterns/auth/team-setup. The examples use the actual export with local sample data and callbacks; applications own routing, permissions and persistence. See the Controls panel for simulated request states.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <AuthPreview initial="TeamSetup" />,
};

export const Retry: Story = {
  name: "Retry",
  render: () => <RetryExample />,
};
