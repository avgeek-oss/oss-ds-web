"use client";

import type { ComponentProps } from "react";
import { Accordion } from "../../data-display/accordion.js";
import {
  ProgressChecklistItem,
  type ProgressChecklistItemProps,
} from "./progress-checklist-item.js";

export type OperationStep = ProgressChecklistItemProps;
export type OperationProgressProps = Omit<
  ComponentProps<typeof Accordion>,
  "children"
> & { steps: readonly OperationStep[] };
export function OperationProgress({ steps, ...props }: OperationProgressProps) {
  return (
    <Accordion
      aria-label="Operation progress"
      allowsMultipleExpanded
      hideSeparator
      defaultExpandedKeys={steps
        .filter(
          (step) =>
            step.status !== "waiting" &&
            step.children != null &&
            (step.defaultExpanded ?? step.status === "failed"),
        )
        .map((step) => step.id)}
      className="grid gap-2"
      {...props}
    >
      {steps.map((step) => (
        <ProgressChecklistItem key={step.id} {...step} />
      ))}
    </Accordion>
  );
}
