import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ChoiceFieldPreview } from "../../studio/pattern-previews";
import { ChoiceField } from "../../src/patterns/choice-field";
import { UserAvatar } from "../../src/patterns/user-avatar";

const people = [
  ["alex", "Alex Taylor", "alex@example.test"],
  ["sam", "Sam Chen", "sam@example.test"],
  ["priya", "Priya Raman", "priya@example.test"],
  ["jordan", "Jordan Lee", "jordan@example.test"],
  ["mina", "Mina Park", "mina@example.test"],
  ["oscar", "Oscar Ruiz", "oscar@example.test"],
] as const;

function AssigneeChoice() {
  const [value, setValue] = useState("");
  return (
    <div className="max-w-sm p-4">
      <ChoiceField
        label="Assignee"
        value={value}
        onChange={setValue}
        search
        fullWidth
        options={[
          { id: "", label: "Unassigned", muted: true },
          ...people.map(([id, name, email]) => ({
            id,
            label: name,
            icon: (
              <UserAvatar
                email={email}
                name={name}
                size="sm"
                className="size-6"
              />
            ),
          })),
        ]}
      />
    </div>
  );
}

function PageSizeChoice() {
  const [value, setValue] = useState("25");
  return (
    <div className="grid max-w-sm gap-6 p-4">
      <ChoiceField
        label="Tasks per page"
        hideLabel
        className="w-40"
        value={value}
        onChange={setValue}
        options={["10", "25", "50", "100"].map((size) => ({
          id: size,
          label: `${size} per page`,
        }))}
      />
      <ChoiceField
        label="Board"
        description="Tasks move with their comments and attachments."
        fullWidth
        value="roadmap"
        onChange={() => {}}
        options={[
          { id: "roadmap", label: "Roadmap", endContent: "42" },
          { id: "support", label: "Support", endContent: "7" },
          {
            id: "archive",
            label: "Archive",
            description: "Read-only",
            endContent: "318",
          },
        ]}
      />
    </div>
  );
}

const meta = {
  title: "Patterns/ChoiceField",
  parameters: {
    docs: {
      description: {
        component:
          "Interactive ChoiceField examples using the shared exports. Applications own routing, permissions and persistence.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <ChoiceFieldPreview />,
};

export const Search: Story = {
  name: "Search",
  render: () => <AssigneeChoice />,
};

export const LabelsAndMetadata: Story = {
  name: "Labels and metadata",
  render: () => <PageSizeChoice />,
};
