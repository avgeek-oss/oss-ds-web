"use client";

import { useState } from "react";
import { Modal } from "../../overlays/modal.js";
import { Button } from "../../buttons/button.js";
import { ChoiceField, type ChoiceOption } from "../choice-field.js";
import { useAsyncAction } from "../use-async-action.js";
import { ApiKeySecret } from "./api-key-secret.js";
import type { IssuedApiKeySecret } from "./create-api-key-dialog.js";

/** How long a rotated key keeps working; ids are seconds. */
export const apiKeyGraceOptions = [
  { id: "0", label: "Stop it now" },
  { id: "3600", label: "1 hour" },
  { id: "86400", label: "24 hours" },
  { id: "604800", label: "7 days" },
] as const satisfies readonly ChoiceOption[];

export type RotateApiKeyDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  apiKey: { name: string };
  /** Ids are whole seconds. */
  graceOptions?: readonly ChoiceOption[];
  /**
   * Replaces the key and resolves to the new secret. Resolve to `undefined`
   * when the app took over instead, such as by starting step-up; the
   * dialog then closes.
   */
  onRotate: (graceSeconds: number) => Promise<IssuedApiKeySecret | undefined>;
};

export function RotateApiKeyDialog(props: RotateApiKeyDialogProps) {
  return props.isOpen ? <RotateContent {...props} /> : null;
}

function RotateContent({
  onOpenChange,
  apiKey,
  graceOptions = apiKeyGraceOptions,
  onRotate,
}: Omit<RotateApiKeyDialogProps, "isOpen">) {
  const [grace, setGrace] = useState(
    graceOptions.find((option) => option.id === "86400")?.id ??
      graceOptions[0]?.id ??
      "0",
  );
  const [secret, setSecret] = useState<string>();
  const action = useAsyncAction("Could not rotate key");
  const valid = graceOptions.some((option) => option.id === grace);
  return (
    <Modal.Backdrop
      isOpen
      onOpenChange={(open) => {
        if (!action.isPending) onOpenChange(open);
      }}
    >
      <Modal.Container size={secret ? "md" : "sm"} scroll="inside">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>
              {secret ? "Copy your API key" : `Rotate ${apiKey.name}?`}
            </Modal.Heading>
            <Modal.CloseTrigger isDisabled={action.isPending} />
          </Modal.Header>
          <Modal.Body>
            {secret ? (
              <ApiKeySecret
                secret={secret}
                onDone={() => onOpenChange(false)}
              />
            ) : (
              <form
                className="grid gap-4"
                aria-busy={action.isPending}
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!valid) return;
                  const result = await action.run(() =>
                    onRotate(Number(grace)),
                  );
                  if (!result.ok) return;
                  if (result.value) setSecret(result.value.key);
                  else onOpenChange(false);
                }}
              >
                <p>
                  A new key replaces this one, with the same name, role and
                  workspace. Keep the old key working long enough to update your
                  scripts.
                </p>
                <ChoiceField
                  label="Old key keeps working"
                  value={grace}
                  options={graceOptions}
                  onChange={setGrace}
                  isRequired
                  isDisabled={action.isPending}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    isDisabled={action.isPending}
                    onPress={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" isDisabled={action.isPending || !valid}>
                    {action.isPending ? "Rotating…" : "Rotate key"}
                  </Button>
                </div>
              </form>
            )}
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
