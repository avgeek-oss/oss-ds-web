"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { Modal } from "../../overlays/modal.js";
import { Button } from "../../buttons/button.js";
import { Field } from "../../forms/field.js";
import { Input } from "../../forms/input.js";
import { Label } from "../../forms/label.js";
import { toast } from "../../overlays/toast.js";
import { ChoiceField, type ChoiceOption } from "../choice-field.js";
import { useAsyncAction } from "../use-async-action.js";
import {
  teamRoleOptions,
  type TeamRole,
} from "../team-settings/team-role-options.js";
import { ApiKeySecret } from "./api-key-secret.js";

/** Expiry choices; ids are whole days, or `never` for no expiry. */
export const apiKeyExpiryOptions = [
  { id: "30", label: "30 days" },
  { id: "90", label: "90 days" },
  { id: "365", label: "1 year" },
  { id: "never", label: "Never" },
] as const satisfies readonly ChoiceOption[];

/** The workspace choice that issues a key for every workspace. */
const allWorkspaces = "*";

/**
 * What the dialog submits. The same shape as `CreateApiKeyInput` from
 * `@avgeek-oss/auth-client`.
 */
export type CreateApiKeyValues = {
  name: string;
  ceiling: TeamRole;
  workspace: string | null;
  /** Lifetime in seconds, or `null` for no expiry. */
  expiresInSeconds: number | null;
};
/** A new key's secret, shown once. */
export type IssuedApiKeySecret = { key: string };
export type CreateApiKeyDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /**
   * The roles the person may give a key, which never exceed their own.
   * Others are not offered.
   */
  ceilings: readonly TeamRole[];
  /** Ids are whole days or `never`; omit `never` where keys must expire. */
  expiryOptions?: readonly ChoiceOption[];
  /**
   * Workspaces a key may be limited to, for apps that issue keys per
   * workspace. Adds a Workspace field with an "All workspaces" choice.
   */
  workspaces?: readonly ChoiceOption[];
  /**
   * Creates the key and resolves to its secret. Resolve to `undefined` when
   * the app took over instead, such as by starting step-up; the dialog
   * then closes.
   */
  onCreate: (
    values: CreateApiKeyValues,
  ) => Promise<IssuedApiKeySecret | undefined>;
  children?: ReactNode;
};
type CreateContentProps = Omit<CreateApiKeyDialogProps, "isOpen">;
export function CreateApiKeyDialog(props: CreateApiKeyDialogProps) {
  return props.isOpen ? <CreateContent {...props} /> : null;
}

export function expiryInSeconds(id: string): number | null {
  return id === "never" ? null : Number(id) * 86_400;
}

function CreateContent({
  onOpenChange,
  ceilings,
  expiryOptions = apiKeyExpiryOptions,
  workspaces,
  onCreate,
  children,
}: CreateContentProps) {
  const nameId = useId();
  const roleOptions = teamRoleOptions.filter((role) =>
    ceilings.includes(role.id),
  );
  const [ceiling, setCeiling] = useState<string>("");
  const [expiry, setExpiry] = useState("");
  const [workspace, setWorkspace] = useState(allWorkspaces);
  const workspaceOptions: readonly ChoiceOption[] | undefined = workspaces
    ? [{ id: allWorkspaces, label: "All workspaces" }, ...workspaces]
    : undefined;
  const [secret, setSecret] = useState<string>();
  const [nameDraft, setNameDraft] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const action = useAsyncAction("Could not create key");
  const role = roleOptions.find((option) => option.id === ceiling)?.id;
  const canCreate =
    role !== undefined &&
    expiryOptions.some((option) => option.id === expiry) &&
    (!workspaceOptions ||
      workspaceOptions.some((option) => option.id === workspace));
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
              {secret ? "Copy your API key" : "Create API key"}
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
                  if (!canCreate) return;
                  const value = new FormData(event.currentTarget).get("name");
                  const name = (typeof value === "string" ? value : "").trim();
                  if (!name) {
                    toast.danger("Enter a name for this API key.");
                    nameRef.current?.focus();
                    return;
                  }
                  const result = await action.run(() =>
                    onCreate({
                      name,
                      ceiling: role,
                      workspace:
                        workspaceOptions && workspace !== allWorkspaces
                          ? workspace
                          : null,
                      expiresInSeconds: expiryInSeconds(expiry),
                    }),
                  );
                  if (!result.ok) return;
                  if (result.value) setSecret(result.value.key);
                  else onOpenChange(false);
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
                    maxLength={100}
                    autoComplete="off"
                    variant="secondary"
                    disabled={action.isPending}
                  />
                </Field>
                <ChoiceField
                  label="Role"
                  value={ceiling}
                  options={roleOptions}
                  onChange={setCeiling}
                  description="The key acts with the lower of this role and your own."
                  isRequired
                  isDisabled={action.isPending}
                />
                {workspaceOptions ? (
                  <ChoiceField
                    label="Workspace"
                    value={workspace}
                    options={workspaceOptions}
                    onChange={setWorkspace}
                    isRequired
                    isDisabled={action.isPending}
                  />
                ) : null}
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
