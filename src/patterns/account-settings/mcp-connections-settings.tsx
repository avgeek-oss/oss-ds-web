"use client";
import { useState } from "react";
import { useConfirmationOpener } from "./use-confirmation-opener.js";
import { Button } from "../../buttons/button.js";
import { ActionConfirmation } from "../actions/action-confirmation.js";
import {
  AuthorizedClientsTable,
  type AuthorizedClient,
  type AuthorizedClientsTableProps,
} from "./api-keys-table.js";
import { mcpClientPresentation } from "../../utilities/mcp-client-presentation.js";

export type McpConnectionsSettingsProps<
  T extends AuthorizedClient = AuthorizedClient,
> = Omit<AuthorizedClientsTableProps<T>, "actions"> & {
  onRevoke: (id: string) => Promise<void>;
};
export function McpConnectionsSettings<T extends AuthorizedClient>({
  onRevoke,
  ...props
}: McpConnectionsSettingsProps<T>) {
  const [revoking, setRevoking] = useState<T | null>(null);
  const opener = useConfirmationOpener(revoking !== null);
  return (
    <>
      <AuthorizedClientsTable
        {...props}
        actions={(client) => (
          <Button
            variant="danger"
            onPress={(event) => {
              opener.current =
                event.target instanceof HTMLElement ? event.target : null;
              setRevoking(client);
            }}
          >
            Disconnect
          </Button>
        )}
      />
      {revoking ? (
        <ActionConfirmation
          isOpen
          title={`Disconnect ${mcpClientPresentation({ name: revoking.clientName, id: revoking.clientId }).name}?`}
          description="It loses access at once, with every token it holds. Connect it again from the app to reconnect."
          confirmLabel="Disconnect"
          onOpenChange={(open) => {
            if (!open) setRevoking(null);
          }}
          onConfirm={() => onRevoke(revoking.id)}
        />
      ) : null}
    </>
  );
}
