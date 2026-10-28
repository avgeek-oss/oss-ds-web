"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Modal } from "../../overlays/modal.js";
import { Button } from "../../buttons/button.js";
import { Field } from "../../forms/field.js";
import { Input } from "../../forms/input.js";
import { Label } from "../../forms/label.js";
import { CodeBlock } from "../../typography/code-block.js";
import { toast } from "../../overlays/toast.js";
import { ChoiceField, type ChoiceOption } from "../choice-field.js";
import { useAsyncAction } from "../use-async-action.js";

export const apiKeyPermissionOptions = [
  { id: "read", label: "Read-only" },
  { id: "edit", label: "Edit" },
  { id: "admin", label: "Administrative permissions" },
] as const satisfies readonly ChoiceOption[];
export const apiKeyExpiryOptions = [
  { id: "30", label: "30 days" },
  { id: "90", label: "90 days" },
  { id: "365", label: "1 year" },
  { id: "never", label: "Never" },
] as const satisfies readonly ChoiceOption[];
export type CreateApiKeyValues = {
  name: string;
  permission: string;
  expiry: string;
};
export type CreatedApiKey = { token: string | null };
export type CreateApiKeyDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  permissionOptions?: readonly ChoiceOption[];
  expiryOptions?: readonly ChoiceOption[];
  onCreate: (values: CreateApiKeyValues) => Promise<CreatedApiKey>;
  children?: ReactNode;
};
type CreateContentProps = Omit<CreateApiKeyDialogProps, "isOpen">;
export function CreateApiKeyDialog(props: CreateApiKeyDialogProps) {
  return props.isOpen ? <CreateContent {...props} /> : null;
}
function CreateContent({
  onOpenChange,
  permissionOptions = apiKeyPermissionOptions,
  expiryOptions = apiKeyExpiryOptions,
  onCreate,
  children,
}: CreateContentProps) {
  const nameId = useId();
  const [permission, setPermission] = useState("");
  const [expiry, setExpiry] = useState("");
  const [created, setCreated] = useState<CreatedApiKey>();
  const [nameDraft, setNameDraft] = useState("");
  const doneRef = useRef<HTMLButtonElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (created) doneRef.current?.focus();
  }, [created]);
  const action = useAsyncAction("Could not create key");
  const canCreate =
    permissionOptions.some((option) => option.id === permission) &&
    expiryOptions.some((option) => option.id === expiry);
  return (
    <Modal.Backdrop
      isOpen
      onOpenChange={(open) => {
        if (!action.isPending) onOpenChange(open);
      }}
    >
      <Modal.Container size={created ? "md" : "sm"} scroll="inside">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>
              {created
                ? created.token
                  ? "Copy your API key"
                  : "Key already created"
                : "Create API key"}
            </Modal.Heading>
            <Modal.CloseTrigger isDisabled={action.isPending} />
          </Modal.Header>
          <Modal.Body>
            {created ? (
              <div className="grid gap-4">
                <p>
                  {created.token
                    ? "Save this token in a secret manager. You won’t be able to view it again."
                    : "This request already created a key. Its token can only be shown in the original response. Revoke it and create a replacement if you did not save it."}
                </p>
                {created.token ? (
                  <CodeBlock>
                    <CodeBlock.Header>
                      <CodeBlock.Filename>Your new key</CodeBlock.Filename>
                      <CodeBlock.CopyButton code={created.token} />
                    </CodeBlock.Header>
                    <CodeBlock.Code code={created.token} />
                  </CodeBlock>
                ) : null}
                <Button ref={doneRef} onPress={() => onOpenChange(false)}>
                  Done
                </Button>
              </div>
            ) : (
              <form
                className="grid gap-4"
                aria-busy={action.isPending}
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!canCreate) return;
                  const value = new FormData(event.currentTarget).get("name");
                  const name = (typeof value === "string" ? value : "").trim();
                  if (!name) {
                    toast.danger("Enter a name for this API key.");
                    nameRef.current?.focus();
                    return;
                  }
                  const result = await action.run(() =>
                    onCreate({ name, permission, expiry }),
                  );
                  if (result.ok) setCreated(result.value);
                }}
              >
                <Field>
                  <Label htmlFor={nameId} isRequired>
                    Name
                  </Label>
                  <Input
                    id={nameId}
                    ref={nameRef}
                    name="name"
                    value={nameDraft}
                    onChange={(event) =>
                      setNameDraft(event.currentTarget.value)
                    }
                    required
                    maxLength={120}
                    autoComplete="off"
                    variant="secondary"
                    disabled={action.isPending}
                  />
                </Field>
                <ChoiceField
                  label="Permissions"
                  value={permission}
                  options={permissionOptions}
                  onChange={setPermission}
                  isRequired
                  isDisabled={action.isPending}
                />
                <ChoiceField
                  label="Expires after"
                  value={expiry}
                  options={expiryOptions}
                  onChange={setExpiry}
                  isRequired
                  isDisabled={action.isPending}
                />
                {children ? (
                  <fieldset disabled={action.isPending}>{children}</fieldset>
                ) : null}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    isDisabled={action.isPending}
                    onPress={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isDisabled={action.isPending || !canCreate}
                  >
                    {action.isPending ? "Creating…" : "Create key"}
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
