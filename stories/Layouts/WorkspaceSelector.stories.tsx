import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { WorkspaceSelector } from "../../src/navigation/workspace-selector";

const items = [
  { id: "default", name: "Default" },
  { id: "design", name: "Design" },
  { id: "long", name: "A workspace with a longer name for truncation" },
];

function Example({
  canCreate = true,
  isDisabled = false,
  initialKey = "default",
}: {
  canCreate?: boolean;
  isDisabled?: boolean;
  initialKey?: string | null;
}) {
  const [selectedKey, setSelectedKey] = useState<string | null>(initialKey);
  const [created, setCreated] = useState(0);
  return (
    <div className="sidebar-body grid w-60">
      <WorkspaceSelector
        items={items}
        selectedKey={selectedKey}
        onSelectionChange={setSelectedKey}
        onCreate={canCreate ? () => setCreated(created + 1) : undefined}
        isDisabled={isDisabled}
      />
      <output className="px-2 text-sm">Created: {created}</output>
    </div>
  );
}

const meta = {
  title: "Layouts/WorkspaceSelector",
  component: WorkspaceSelector,
  parameters: {
    docs: {
      description: {
        component:
          "Workspace selection in ApplicationSidebar's workspace slot. Apps own switching, creation and permissions.",
      },
    },
  },
} satisfies Meta<typeof WorkspaceSelector>;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  render: () => <Example />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: /Workspace/ }));
    await userEvent.click(await body.findByRole("option", { name: "Design" }));
    await expect(
      canvas.getByRole("button", { name: /Workspace/ }),
    ).toHaveTextContent(/^Design$/);
    const trigger = canvas.getByRole("button", { name: /Workspace/ });
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    const create = await body.findByRole("option", {
      name: "Create Workspace",
    });
    await userEvent.keyboard("{End}");
    await waitFor(() => expect(create).toHaveFocus());
    await expect(canvas.getByText("Created: 0")).toBeVisible();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByText("Created: 1")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: /Workspace/ }),
    ).toHaveTextContent(/^Design$/);
  },
};

export const WithoutCreation: Story = {
  render: () => <Example canCreate={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: /Workspace/ }));
    const listbox = await body.findByRole("listbox");
    await waitFor(() => expect(listbox).toBeVisible());
    await expect(
      body.queryByRole("option", { name: "Create Workspace" }),
    ).toBeNull();
  },
};
export const Disabled: Story = {
  render: () => <Example isDisabled />,
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: /Workspace/ }),
    ).toBeDisabled();
  },
};
export const Unselected: Story = {
  render: () => <Example initialKey={null} />,
};
