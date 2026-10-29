"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import type {
  ApiKey,
  CreateApiKeyInput,
  IssuedApiKey,
  Role,
} from "@avgeek-oss/auth-client";
import { Button } from "../../../buttons/button.js";
import { Dialog } from "../../../overlays/dialog.js";
import { toast } from "../../../overlays/toast.js";
import { QueryError, QueryLoading } from "../../feedback/query-state.js";
import type { ChoiceOption } from "../../choice-field.js";
import { ApiKeysSettings } from "../../account-settings/api-keys-settings.js";
import { ApiKeySecret } from "../../account-settings/api-key-secret.js";
import {
  CreateApiKeyDialog,
  type CreateApiKeyValues,
} from "../../account-settings/create-api-key-dialog.js";
import { StepUpDialog } from "../step-up-dialog.js";
import {
  authErrorCode,
  errorMessage,
  useConnectedList,
  useConnectedSession,
  takeStepUpResume,
  useNavigate,
  useStepUpFlow,
  type ConnectedBaseProps,
} from "./shared.js";

export type ConnectedApiKeysSettingsProps = ConnectedBaseProps & {
  providerName: string;
  formatDate: (value: string) => ReactNode;
  /** Workspaces a key may be limited to, for apps with per-workspace keys. */
  workspaces?: readonly ChoiceOption[];
  /** Ids are whole days or `never`. */
  expiryOptions?: readonly ChoiceOption[];
  /** Ids are whole seconds. */
  graceOptions?: readonly ChoiceOption[];
};

const ROLE_ORDER: readonly Role[] = ["viewer", "member", "admin"];
function rolesUpTo(role: Role): Role[] {
  return ROLE_ORDER.slice(0, ROLE_ORDER.indexOf(role) + 1);
}

type Rotation = { id: string; graceSeconds: number };

function isCreateInput(value: unknown): value is CreateApiKeyValues {
  if (typeof value !== "object" || value === null) return false;
  const input = value as Record<string, unknown>;
  return (
    typeof input.name === "string" &&
    ROLE_ORDER.includes(input.ceiling as Role) &&
    (input.workspace === null || typeof input.workspace === "string") &&
    (input.expiresInSeconds === null ||
      typeof input.expiresInSeconds === "number")
  );
}
function isRotation(value: unknown): value is Rotation {
  if (typeof value !== "object" || value === null) return false;
  const input = value as Record<string, unknown>;
  return typeof input.id === "string" && typeof input.graceSeconds === "number";
}

/**
 * The signed-in person's API keys: list, create with a role ceiling,
 * rotate with a grace period and revoke. An admin key needs a recent
 * sign-in, so creating or rotating one steps up first and finishes when
 * the person comes back.
 */
export function ConnectedApiKeysSettings({
  client,
  navigate: navigateProp,
  providerName,
  formatDate,
  workspaces,
  expiryOptions,
  graceOptions,
}: ConnectedApiKeysSettingsProps) {
  const navigate = useNavigate(navigateProp);
  const session = useConnectedSession(client, navigate);
  const keys = useConnectedList<ApiKey>(
    () => client.apiKeys.list(),
    "Could not load your API keys.",
  );
  const stepUp = useStepUpFlow(client, navigate);
  const { requireStepUp } = stepUp;
  const [creating, setCreating] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const { update, refetch } = keys;

  const issued = useCallback(
    (result: IssuedApiKey, replaced?: string) => {
      update((items) => [
        result.apiKey,
        ...items.filter((item) => item.id !== result.apiKey.id),
      ]);
      // The rotated key's grace period comes from the server.
      if (replaced) void refetch();
    },
    [refetch, update],
  );

  const create = useCallback(
    async (input: CreateApiKeyInput) => {
      try {
        const result = await client.apiKeys.create(input);
        issued(result);
        return { key: result.key };
      } catch (error) {
        if (authErrorCode(error) !== "step_up_required") throw error;
        requireStepUp(
          { action: "api-keys:create", input },
          "Creating an admin API key needs a recent sign-in.",
        );
        return undefined;
      }
    },
    [client, issued, requireStepUp],
  );
  const rotate = useCallback(
    async (id: string, graceSeconds: number) => {
      try {
        const result = await client.apiKeys.rotate(id, { graceSeconds });
        issued(result, id);
        return { key: result.key };
      } catch (error) {
        if (authErrorCode(error) !== "step_up_required") throw error;
        requireStepUp(
          { action: "api-keys:rotate", input: { id, graceSeconds } },
          "Rotating an admin API key needs a recent sign-in.",
        );
        return undefined;
      }
    },
    [client, issued, requireStepUp],
  );

  // Back from step-up: finish the create or rotate the person started.
  const ready = keys.state.status === "ready";
  useEffect(() => {
    if (!ready) return;
    const created = takeStepUpResume("api-keys:create");
    const rotated = takeStepUpResume("api-keys:rotate");
    const run = isCreateInput(created)
      ? () => create(created)
      : isRotation(rotated)
        ? () => rotate(rotated.id, rotated.graceSeconds)
        : null;
    if (!run) return;
    run().then(
      (result) => {
        if (result) setSecret(result.key);
      },
      (error: unknown) =>
        toast.danger(errorMessage(error, "Could not finish the change.")),
    );
  }, [create, ready, rotate]);

  if (session.state.status === "error")
    return (
      <QueryError
        message={session.state.message}
        onRetry={() => void session.reload()}
      />
    );
  if (keys.state.status === "error")
    return <QueryError message={keys.state.message} onRetry={keys.retry} />;
  if (session.state.status === "loading" || keys.state.status === "loading")
    return <QueryLoading>Loading API keys…</QueryLoading>;
  const workspaceNames = new Map(
    (workspaces ?? []).map((option) => [option.id, option.label]),
  );
  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Button onPress={() => setCreating(true)}>Create API key</Button>
      </div>
      <ApiKeysSettings
        items={keys.state.items}
        formatDate={formatDate}
        workspaceLabel={(id) => workspaceNames.get(id) ?? id}
        graceOptions={graceOptions}
        onRotate={rotate}
        onRevoke={async (id) => {
          const previous =
            keys.state.status === "ready" ? keys.state.items : [];
          update((items) => items.filter((item) => item.id !== id));
          try {
            await client.apiKeys.revoke(id);
          } catch (error) {
            update(() => previous);
            throw error;
          }
        }}
      />
      <CreateApiKeyDialog
        isOpen={creating}
        onOpenChange={setCreating}
        ceilings={rolesUpTo(session.state.session.user.role)}
        workspaces={workspaces}
        expiryOptions={expiryOptions}
        onCreate={create}
      />
      <Dialog
        open={secret !== null}
        onClose={() => setSecret(null)}
        title="Copy your API key"
      >
        {secret !== null ? (
          <ApiKeySecret secret={secret} onDone={() => setSecret(null)} />
        ) : null}
      </Dialog>
      <StepUpDialog providerName={providerName} {...stepUp.dialog} />
    </div>
  );
}
