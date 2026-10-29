"use client";

import { useState } from "react";
import {
  ApiKeysTable,
  isApiKeyUsable,
  type ApiKey,
  type ApiKeysTableProps,
} from "./api-keys-table.js";
import { Button } from "../../buttons/button.js";
import { ActionConfirmation } from "../actions/action-confirmation.js";
import { useConfirmationOpener } from "./use-confirmation-opener.js";
import {
  RotateApiKeyDialog,
  type RotateApiKeyDialogProps,
} from "./rotate-api-key-dialog.js";

export type ApiKeysSettingsProps<T extends ApiKey = ApiKey> = Omit<
  ApiKeysTableProps<T>,
  "actions"
> & {
  onRevoke: (id: string) => Promise<void>;
  /**
   * Replaces a key, the old one working for `graceSeconds`, and resolves
   * to the new secret. Adds a Rotate action to usable keys that have not
   * been rotated.
   */
  onRotate?: (
    id: string,
    graceSeconds: number,
  ) => ReturnType<RotateApiKeyDialogProps["onRotate"]>;
  graceOptions?: RotateApiKeyDialogProps["graceOptions"];
  /** Extra row actions, before Rotate and Revoke. */
  actions?: ApiKeysTableProps<T>["actions"];
};
export function ApiKeysSettings<T extends ApiKey>({
  items,
  formatDate,
  workspaceLabel,
  emptyDescription,
  onRevoke,
  onRotate,
  graceOptions,
  actions,
}: ApiKeysSettingsProps<T>) {
  const [revoking, setRevoking] = useState<T | null>(null);
  const [rotating, setRotating] = useState<T | null>(null);
  const opener = useConfirmationOpener(revoking !== null || rotating !== null);
  return (
    <>
      <ApiKeysTable
        items={items}
        formatDate={formatDate}
        workspaceLabel={workspaceLabel}
        emptyDescription={emptyDescription}
        actions={(item) => (
          <>
            {actions?.(item)}
            {onRotate && item.replacedBy === null && isApiKeyUsable(item) ? (
              <Button
                variant="secondary"
                onPress={(event) => {
                  opener.current =
                    event.target instanceof HTMLElement ? event.target : null;
                  setRotating(item);
                }}
              >
                Rotate
              </Button>
            ) : null}
            <Button
              variant="danger"
              onPress={(event) => {
                opener.current =
                  event.target instanceof HTMLElement ? event.target : null;
                setRevoking(item);
              }}
            >
              Revoke
            </Button>
          </>
        )}
      />
      {revoking ? (
        <ActionConfirmation
          isOpen
          title={`Revoke ${revoking.name}?`}
          description="Any script or app using this key loses access at once. Create a replacement key to reconnect."
          confirmLabel="Revoke key"
          onOpenChange={(open) => {
            if (!open) setRevoking(null);
          }}
          onConfirm={() => onRevoke(revoking.id)}
        />
      ) : null}
      {rotating && onRotate ? (
        <RotateApiKeyDialog
          isOpen
          apiKey={rotating}
          graceOptions={graceOptions}
          onOpenChange={(open) => {
            if (!open) setRotating(null);
          }}
          onRotate={(graceSeconds) => onRotate(rotating.id, graceSeconds)}
        />
      ) : null}
    </>
  );
}
