import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TextField } from "../../src/patterns/text-field";

function TextFieldExample({ multiline = false }: { multiline?: boolean }) {
  const [value, setValue] = useState("");
  return (
    <div className="grid max-w-sm gap-4 p-4">
      {multiline ? (
        <TextField
          multiline
          label="Description"
          description="Shown to everyone on the board."
          value={value}
          maxLength={2000}
          onChange={(event) => setValue(event.target.value)}
        />
      ) : (
        <TextField
          label="Bluesky handle or server URL"
          description="For example name.bsky.social."
          placeholder="name.bsky.social"
          value={value}
          required
          maxLength={2048}
          autoCapitalize="none"
          spellCheck={false}
          onChange={(event) => setValue(event.target.value)}
        />
      )}
    </div>
  );
}

const meta = {
  title: "Patterns/TextField",
  component: TextField,
  parameters: {
    docs: {
      description: {
        component:
          "Use TextField from @avgeek-oss/design-system/patterns/text-field for a labelled native input or textarea. Native input props pass through.",
      },
    },
  },
} satisfies Meta<typeof TextField>;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <TextFieldExample />,
};
export const Multiline: Story = {
  name: "Multiline",
  render: () => <TextFieldExample multiline />,
};
