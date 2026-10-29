import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ProgressChecklistItemPreview } from "../../../studio/pattern-previews";
import { Accordion } from "../../../src/data-display/accordion";
import { Button } from "../../../src/buttons/button";
import { ProgressChecklistItem } from "../../../src/patterns/operations/progress-checklist-item";

function FailingItem() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="grid gap-4 p-4">
      <Button
        variant="secondary"
        className="w-fit"
        onPress={() => setFailed((value) => !value)}
      >
        {failed ? "Retry build" : "Fail build"}
      </Button>
      <Accordion allowsMultipleExpanded hideSeparator className="grid gap-2">
        <ProgressChecklistItem
          id="build"
          title="Build application"
          description={
            failed ? "The build command failed." : "Running the build command…"
          }
          status={failed ? "failed" : "running"}
        >
          <p className="text-sm text-muted">
            {failed
              ? "Could not find the configured build command."
              : "Installing dependencies."}
          </p>
        </ProgressChecklistItem>
        <ProgressChecklistItem
          id="checkout"
          title="Check out repository"
          description="Completed in 2 seconds"
          status="succeeded"
          defaultExpanded
        >
          <p className="text-sm text-muted">Checked out commit a1b2c3d.</p>
        </ProgressChecklistItem>
      </Accordion>
    </div>
  );
}

const meta = {
  title: "Patterns/Operations/ProgressChecklistItem",
  parameters: {
    docs: {
      description: {
        component:
          "Interactive ProgressChecklistItem examples using the shared exports. Applications own routing, permissions and persistence.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <ProgressChecklistItemPreview />,
};

export const FailsWhileShown: Story = {
  name: "Fails while shown",
  render: () => <FailingItem />,
};
