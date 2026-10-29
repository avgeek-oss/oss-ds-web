"use client";

import { useState, type ComponentProps } from "react";
import { SessionsTable, type Session } from "../settings/tables.js";
import { Button } from "../../buttons/button.js";
import { toast } from "../../overlays/toast.js";
import { useOverlaySuspension } from "../../overlays/overlay-suspension.js";
import { AsyncActionButton } from "../actions/async-action-button.js";
import { SettingsConfirmation } from "./settings-confirmation.js";

export type { Session } from "../settings/tables.js";

export type SessionsSettingsProps = Omit<
  ComponentProps<typeof SessionsTable>,
  "actions"
> & {
  /** Signs this browser out. */
  onSignOutCurrent: () => Promise<void>;
  /** Signs another session out; omit when the app cannot. */
  onSignOut?: (id: string) => Promise<void>;
  /** Ends every session, this one included; omit when the app cannot. */
  onSignOutEverywhere?: () => Promise<void>;
};

export function SessionsSettings({
  items,
  formatDate,
  onSignOutCurrent,
  onSignOut,
  onSignOutEverywhere,
}: SessionsSettingsProps) {
  const suspension = useOverlaySuspension();
  const [signingOut, setSigningOut] = useState<Session | null>(null);
  const [everywhere, setEverywhere] = useState(false);
  return (
    <div className="grid gap-4">
      {onSignOutEverywhere ? (
        <div className="flex justify-end">
          <Button variant="danger-soft" onPress={() => setEverywhere(true)}>
            Sign out everywhere
          </Button>
        </div>
      ) : null}
      <SessionsTable
        items={items}
        formatDate={formatDate}
        actions={(item) =>
          item.current ? (
            <AsyncActionButton
              variant="secondary"
              pendingLabel="Signing out…"
              onAction={onSignOutCurrent}
            >
              Sign out
            </AsyncActionButton>
          ) : onSignOut ? (
            <Button variant="danger" onPress={() => setSigningOut(item)}>
              Sign out
            </Button>
          ) : null
        }
      />
      {signingOut && onSignOut ? (
        <SettingsConfirmation
          title={`Sign out ${signingOut.name}?`}
          description="That browser loses access at once and must sign in again."
          confirmLabel="Sign out"
          cancelLabel="Keep signed in"
          onClose={() => setSigningOut(null)}
          onConfirm={async () => {
            const isCurrent = suspension.capture();
            await onSignOut(signingOut.id);
            if (isCurrent()) toast.success("Signed out");
          }}
        />
      ) : null}
      {everywhere && onSignOutEverywhere ? (
        <SettingsConfirmation
          title="Sign out everywhere?"
          description="Every browser signed in to your account, this one included, must sign in again. API keys and connected apps keep working."
          confirmLabel="Sign out everywhere"
          onClose={() => setEverywhere(false)}
          onConfirm={onSignOutEverywhere}
        />
      ) : null}
    </div>
  );
}
