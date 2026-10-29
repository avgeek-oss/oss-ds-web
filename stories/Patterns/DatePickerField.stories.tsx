import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DatePickerField } from "../../src/patterns/date-picker-field";

function DatePickerFieldExample({
  initial = null,
  isDisabled = false,
}: {
  initial?: string | null;
  isDisabled?: boolean;
}) {
  const [value, setValue] = useState(initial);
  return (
    <div className="grid max-w-sm gap-2 p-4">
      <DatePickerField
        label="Due date"
        value={value}
        onChange={setValue}
        isDisabled={isDisabled}
      />
      <p className="text-xs text-muted">Value: {value ?? "none"}</p>
    </div>
  );
}

const meta = {
  title: "Patterns/DatePickerField",
  component: DatePickerField,
  parameters: {
    docs: {
      description: {
        component:
          "Use DatePickerField from @avgeek-oss/design-system/patterns/date-picker-field for a clearable calendar date stored as YYYY-MM-DD.",
      },
    },
  },
} satisfies Meta<typeof DatePickerField>;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <DatePickerFieldExample initial="2026-10-16" />,
};
export const Empty: Story = {
  name: "Empty",
  render: () => <DatePickerFieldExample />,
};
export const Disabled: Story = {
  name: "Disabled",
  render: () => <DatePickerFieldExample initial="2026-10-16" isDisabled />,
};
