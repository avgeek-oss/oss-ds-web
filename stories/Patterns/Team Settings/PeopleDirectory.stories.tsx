import type { Meta, StoryObj } from "@storybook/react-vite";
import { PeopleDirectory } from "../../../src/patterns/team-settings/people-directory";
import {
  PeopleDirectoryPreview,
  people,
} from "../../../studio/pattern-previews";

const meta = {
  title: "Patterns/Team Settings/PeopleDirectory",
  component: PeopleDirectory,
  parameters: {
    docs: {
      description: {
        component:
          "Use the published PeopleDirectory component from @avgeek-oss/design-system/patterns/team-settings/people-directory. It is a read-only directory mirrored from the identity provider through SCIM: name, email, role, where the role came from and last sign-in. A person without a role is suspended. Roles and app access are changed in the provider, not here.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <PeopleDirectoryPreview />,
};

export const LongContent: Story = {
  name: "Long content",
  render: () => (
    <div className="p-4">
      <PeopleDirectory
        items={people.map((person) => ({
          ...person,
          name: person.name
            ? `${person.name} ${"Montgomery ".repeat(4)}`
            : null,
        }))}
        providerName="authentik"
        formatDate={(value) => value.slice(0, 10)}
      />
    </div>
  ),
};
