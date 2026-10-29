import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { PrimitivePreview, Variant } from "../../../studio/primitive-preview";
import { Dialog } from "../../../src/overlays/dialog";
import { Button } from "../../../src/buttons/button";
import { TextField } from "../../../src/patterns/text-field";

function DialogExample({
  wide = false,
  pending = false,
}: {
  wide?: boolean;
  pending?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onPress={() => setOpen(true)}>
        {pending ? "Saving dialog" : wide ? "Wide dialog" : "Dialog"}
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Rename board"
        wide={wide}
        isDismissDisabled={pending}
        footer={
          <>
            <Button
              variant="secondary"
              isDisabled={pending}
              onPress={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button isPending={pending} onPress={() => setOpen(false)}>
              Save
            </Button>
          </>
        }
      >
        <TextField label="Board name" defaultValue="Roadmap" />
      </Dialog>
    </>
  );
}

function DialogVariants({ section = 0 }: { section?: number }) {
  return (
    <PrimitivePreview title="Dialog">
      {section === 0 && (
        <Variant title="Default">
          <DialogExample />
        </Variant>
      )}
      {section === 1 && (
        <Variant title="Wide">
          <DialogExample wide />
        </Variant>
      )}
      {section === 2 && (
        <Variant title="Dismissal disabled">
          <DialogExample pending />
        </Variant>
      )}
    </PrimitivePreview>
  );
}

const meta = {
  title: "Primitives/Overlays/Dialog",
  component: Dialog,
  parameters: {
    docs: {
      description: {
        component:
          "Use Dialog from @avgeek-oss/design-system/overlays/dialog for a titled modal with an optional footer. Compose Modal directly for other structures.",
      },
    },
  },
} satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <DialogVariants section={0} />,
};
export const Wide: Story = {
  name: "Wide",
  render: () => <DialogVariants section={1} />,
};
export const DismissalDisabled: Story = {
  name: "Dismissal disabled",
  render: () => <DialogVariants section={2} />,
};
