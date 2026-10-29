import type { Meta, StoryObj } from "@storybook/react-vite";
import { renderToStaticMarkup } from "react-dom/server";

import {
  AuthEmail,
  authEmailTemplates,
  type AuthEmailTemplate,
} from "../../../src/emails/auth-email";
function EmailPreview({
  template = "role-changed",
  app = "Towbar",
}: {
  template?: AuthEmailTemplate;
  app?: "Towbar" | "Mill" | "Rootset" | "Vitalog";
}) {
  const accents: Record<string, string> = {
    Towbar: "#f3c530",
    Mill: "#734626",
    Rootset: "#2c5f40",
    Vitalog: "#bd2936",
  };
  const email = (
    <AuthEmail
      template={template}
      data={{
        brand: {
          name: app,
          accentColor: accents[app] ?? "#0866bd",
          theme: { accentForeground: app === "Towbar" ? "#1a1813" : "#ffffff" },
        },
        teamName: "Example team",
        actionUrl: "https://example.test/action#safe-example",
        providerName: "authentik",
        role: "member",
      }}
    />
  );
  return (
    <iframe
      title="Authentication email preview"
      srcDoc={renderToStaticMarkup(email)}
      className="h-screen w-full border-0"
    />
  );
}

const meta = {
  args: { template: "role-changed", app: "Towbar" },
  argTypes: {
    template: { control: "select", options: [...authEmailTemplates] },
    app: {
      control: "select",
      options: ["Towbar", "Mill", "Rootset", "Vitalog"],
    },
  },
  title: "Patterns/Emails/AuthEmail",
  component: AuthEmail,
  parameters: {
    docs: {
      description: {
        component:
          "Use the published AuthEmail component from @avgeek-oss/design-system/emails/auth-email. The examples use the actual export with local sample data and callbacks; applications own routing, permissions and persistence. See the Controls panel for simulated request states.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: (args) => <EmailPreview {...args} />,
};
