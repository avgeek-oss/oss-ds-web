import type { Meta, StoryObj } from "@storybook/react-vite";
import { HistorySearchPreview } from "../../../studio/pattern-previews";

const meta = {
  title: "Patterns/History/HistorySearch",
  parameters: {
    docs: {
      description: {
        component:
          "Interactive HistorySearch examples using the shared exports. Applications own routing, permissions and persistence.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <HistorySearchPreview />,
};

export const AppliedSearch: Story = {
  name: "Applied search",
  render: () => <HistorySearchPreview initialSearch="invitation" />,
};
