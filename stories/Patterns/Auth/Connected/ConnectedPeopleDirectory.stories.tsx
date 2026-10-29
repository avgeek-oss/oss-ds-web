import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConnectedPeopleDirectory } from "../../../../src/patterns/auth/connected";
import { ConnectedPeoplePreview } from "../../../../studio/connected-previews";

const meta = {
  title: "Patterns/Auth/Connected/ConnectedPeopleDirectory",
  component: ConnectedPeopleDirectory,
  parameters: {
    docs: {
      description: {
        component:
          "ConnectedPeopleDirectory from @avgeek-oss/design-system/patterns/auth/connected pages through client.admin.users for admins, with a debounced search on name and email, a status filter and previous/next pages, into the read-only PeopleDirectory. Roles and access are managed in the provider; workspace membership stays with the app. The example runs against an in-memory fake client with five people per page.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <ConnectedPeoplePreview />,
};

export const NotAnAdmin: Story = {
  name: "Not an admin",
  render: () => <ConnectedPeoplePreview role="member" />,
};

export const LoadFailure: Story = {
  name: "Load failure",
  render: () => <ConnectedPeoplePreview failLists />,
};
