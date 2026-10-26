import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { AgentChatTrigger } from "../../../src/patterns/agent-chat/agent-chat-trigger";

function TriggerPreview({
  needsAttention = false,
}: {
  needsAttention?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="grid justify-items-start gap-3 p-4 text-sm">
      <AgentChatTrigger
        isOpen={open}
        onOpenChange={setOpen}
        needsAttention={needsAttention}
      />
      <p className="text-muted">{open ? "Panel open" : "Panel closed"}</p>
    </div>
  );
}

const meta = {
  title: "Patterns/Agent Chat/AgentChatTrigger",
  parameters: {
    docs: {
      description: {
        component:
          "Use the published AgentChatTrigger from @avgeek-oss/design-system/patterns/agent-chat/agent-chat-trigger in ApplicationNavbar's actions. It toggles AppLayout's aside and marks actions waiting for approval while the panel is closed.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <TriggerPreview />,
};

export const NeedsApproval: Story = {
  render: () => <TriggerPreview needsAttention />,
};
