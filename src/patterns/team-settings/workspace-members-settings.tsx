"use client";

import { useState, type ReactNode } from "react";
import { Button } from "../../buttons/button.js";
import { Dialog } from "../../overlays/dialog.js";
import { ActionConfirmation } from "../actions/action-confirmation.js";
import { ChoiceField } from "../choice-field.js";
import { useAsyncAction } from "../use-async-action.js";
import { useConfirmationOpener } from "../account-settings/use-confirmation-opener.js";
import {
  PeopleDirectory,
  personName,
  type DirectoryPerson,
} from "./people-directory.js";

export type WorkspaceMembersSettingsProps<
  T extends DirectoryPerson = DirectoryPerson,
> = {
  workspaceName: string;
  /** The organisation's identity provider, such as "authentik". */
  providerName: string;
  /** People in this workspace. */
  members: T[];
  /**
   * Everyone in the directory. People with a role who are not members yet
   * can be added.
   */
  people: readonly DirectoryPerson[];
  formatDate: (value: string) => ReactNode;
  currentUserId?: string;
  onAdd: (personId: string) => Promise<void>;
  onRemove: (personId: string) => Promise<void>;
};

/**
 * Workspace membership, which the app owns. Roles and app access stay in
 * the identity provider.
 */
export function WorkspaceMembersSettings<T extends DirectoryPerson>({
  workspaceName,
  providerName,
  members,
  people,
  formatDate,
  currentUserId,
  onAdd,
  onRemove,
}: WorkspaceMembersSettingsProps<T>) {
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<T | null>(null);
  const opener = useConfirmationOpener(removing !== null);
  const memberIds = new Set(members.map((member) => member.id));
  const candidates = people.filter(
    (person) =>
      !memberIds.has(person.id) &&
      person.role !== null &&
      person.active !== false,
  );
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Members of {workspaceName} can use its resources with their role.
          Roles and app access are managed in {providerName}.
        </p>
        <Button
          variant="secondary"
          isDisabled={candidates.length === 0}
          onPress={() => setAdding(true)}
        >
          Add people
        </Button>
      </div>
      <PeopleDirectory
        items={members}
        providerName={providerName}
        formatDate={formatDate}
        currentUserId={currentUserId}
        note={null}
        emptyDescription={`Add people to ${workspaceName}.`}
        actions={(member) => (
          <Button
            variant="danger"
            onPress={(event) => {
              opener.current =
                event.target instanceof HTMLElement ? event.target : null;
              setRemoving(member);
            }}
          >
            Remove
          </Button>
        )}
      />
      {adding ? (
        <AddPersonDialog
          workspaceName={workspaceName}
          candidates={candidates}
          onClose={() => setAdding(false)}
          onAdd={onAdd}
        />
      ) : null}
      {removing ? (
        <ActionConfirmation
          isOpen
          title={`Remove ${personName(removing)} from ${workspaceName}?`}
          description={`They lose access to this workspace. Their role in the app doesn't change; that's managed in ${providerName}.`}
          confirmLabel="Remove"
          onOpenChange={(open) => {
            if (!open) setRemoving(null);
          }}
          onConfirm={() => onRemove(removing.id)}
        />
      ) : null}
    </div>
  );
}

function AddPersonDialog({
  workspaceName,
  candidates,
  onClose,
  onAdd,
}: {
  workspaceName: string;
  candidates: readonly DirectoryPerson[];
  onClose: () => void;
  onAdd: (personId: string) => Promise<void>;
}) {
  const [personId, setPersonId] = useState("");
  const action = useAsyncAction("Could not add them");
  const chosen = candidates.some((person) => person.id === personId);
  return (
    <Dialog
      open
      size="sm"
      title={`Add people to ${workspaceName}`}
      isDismissDisabled={action.isPending}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="secondary"
            isDisabled={action.isPending}
            onPress={onClose}
          >
            Cancel
          </Button>
          <Button
            isDisabled={!chosen || action.isPending}
            onPress={async () => {
              const result = await action.run(() => onAdd(personId));
              if (result.ok) onClose();
            }}
          >
            {action.isPending ? "Adding…" : "Add"}
          </Button>
        </>
      }
    >
      <ChoiceField
        label="Person"
        search
        fullWidth
        value={personId}
        options={candidates.map((person) => ({
          id: person.id,
          label: personName(person),
          description: person.email ?? undefined,
        }))}
        onChange={setPersonId}
        isRequired
        isDisabled={action.isPending}
      />
    </Dialog>
  );
}
