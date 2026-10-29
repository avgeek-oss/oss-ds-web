"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { AuthScreen } from "./auth-screen.js";
import { AuthAction } from "./auth-action.js";
import { Button } from "../../buttons/button.js";
import { Alert } from "../../feedback/alert.js";
import { InputGroup } from "../../forms/input-group.js";
import { Field } from "../../forms/field.js";
import { Input } from "../../forms/input.js";
import { Label } from "../../forms/label.js";
import { Select, ListBox } from "../../forms/select.js";
import { toast } from "../../overlays/toast.js";
import { mcpClientPresentation } from "../../utilities/mcp-client-presentation.js";
import type { ChoiceOption } from "../choice-field.js";
import {
  teamRoleOptions,
  type TeamRole,
} from "../team-settings/team-role-options.js";

/** The client asking for access, as the consent request describes it. */
export type McpAuthorizationClient = {
  name: string;
  /** The OAuth client id, such as a metadata document URL. */
  id?: string;
  /** An app-supplied logo; takes precedence over `logoUri`. */
  logo?: ReactNode;
  /** The logo the client registered, or `null`. */
  logoUri?: string | null;
  /** Where the authorization code goes. Always shown. */
  redirectHost: string;
  /** The redirect is to this computer, such as a CLI on a loopback port. */
  localhost: boolean;
};

/** What the grant will act on, such as the MCP endpoint. */
export type McpAuthorizationResource = { uri: string; name: string | null };

/** An optional workspace limit, for apps whose grants can be scoped. */
export type McpAuthorizationWorkspace = {
  options: readonly ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
  /** Field label; "Workspace" by default. */
  label?: string;
};

export type McpAuthorizationProps = {
  brand: ReactNode;
  productName: string;
  client: McpAuthorizationClient;
  /** Shown as "Access to"; omit when the app has a single resource. */
  resources?: readonly McpAuthorizationResource[];
  /** The highest role the connection may act with. */
  ceiling: TeamRole;
  /**
   * The roles the person may choose, which never exceed their own. Others
   * are shown disabled.
   */
  ceilings: readonly TeamRole[];
  onCeilingChange: (value: TeamRole) => void;
  workspace?: McpAuthorizationWorkspace;
  isPending?: boolean;
  /**
   * Blocks both decisions without a pending state, for example after an
   * uncertain answer to a decision that must not be sent twice.
   */
  isDisabled?: boolean;
  /** A failed decision, reported once as a toast. */
  error?: ReactNode;
  /** A persistent reason approval is unavailable, shown inline. */
  approvalBlockedReason?: ReactNode;
  onApprove: () => void;
  onDeny: () => void;
};

function ClientLogo({ client }: { client: McpAuthorizationClient }) {
  if (client.logo) return client.logo;
  if (!client.logoUri) return null;
  return (
    <img
      src={client.logoUri}
      alt=""
      referrerPolicy="no-referrer"
      className="size-5 rounded-sm object-contain"
    />
  );
}

export function McpAuthorization({
  brand,
  productName,
  client,
  resources = [],
  ceiling,
  ceilings,
  onCeilingChange,
  workspace,
  isPending = false,
  isDisabled = false,
  error,
  approvalBlockedReason,
  onApprove,
  onDeny,
}: McpAuthorizationProps) {
  const applicationId = useId();
  const redirectId = useId();
  const resourceId = useId();
  const presented = mcpClientPresentation({
    name: client.name,
    id: client.id,
    logo:
      client.logo || client.logoUri ? (
        <ClientLogo client={client} />
      ) : undefined,
  });
  const reportedError = useRef<ReactNode>(undefined);
  useEffect(() => {
    if (error != null && error !== reportedError.current) toast.danger(error);
    reportedError.current = error;
  }, [error]);
  const selected = teamRoleOptions.find((role) => role.id === ceiling);
  const approvalBlocked =
    approvalBlockedReason != null ||
    !ceilings.includes(ceiling) ||
    (workspace !== undefined &&
      !workspace.options.some((option) => option.id === workspace.value));
  const disabled = isPending || isDisabled;
  const highest = teamRoleOptions.find(
    (role) => role.id === ceilings[ceilings.length - 1],
  );
  return (
    <AuthScreen
      brand={brand}
      title={`Connect to ${productName}`}
      description={`${presented.name} wants to act for you in ${productName}. Choose the highest role it may use.`}
    >
      <form
        className="grid min-w-0 gap-6 text-sm"
        method="post"
        aria-busy={isPending}
        onSubmit={(event) => {
          event.preventDefault();
          if (!disabled && !approvalBlocked) onApprove();
        }}
      >
        <Field>
          <Label htmlFor={applicationId}>Application</Label>
          <InputGroup variant="primary" isDisabled>
            {presented.logo ? (
              <InputGroup.Prefix>
                <span
                  aria-hidden="true"
                  className="flex size-5 shrink-0 items-center justify-center [&_img]:size-5 [&_svg]:size-5"
                >
                  {presented.logo}
                </span>
              </InputGroup.Prefix>
            ) : null}
            <InputGroup.Input
              id={applicationId}
              value={presented.name}
              disabled
              readOnly
            />
          </InputGroup>
        </Field>
        <Field>
          <Label htmlFor={redirectId}>Returns to</Label>
          <Input
            id={redirectId}
            variant="primary"
            value={client.redirectHost}
            disabled
            readOnly
          />
        </Field>
        {client.localhost ? (
          <Alert status="warning">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>This address is on your computer</Alert.Title>
              <Alert.Description>
                Allow it only if you started {presented.name} yourself on this
                device.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}
        {resources.length > 0 ? (
          <Field>
            <Label htmlFor={resourceId}>Access to</Label>
            <Input
              id={resourceId}
              variant="primary"
              value={resources
                .map((resource) => resource.name ?? resource.uri)
                .join(", ")}
              disabled
              readOnly
            />
          </Field>
        ) : null}
        <Select
          aria-label="Role"
          variant="primary"
          selectedKey={ceiling}
          isDisabled={disabled}
          disabledKeys={teamRoleOptions
            .filter((role) => !ceilings.includes(role.id))
            .map((role) => role.id)}
          onSelectionChange={(key) => {
            const role = teamRoleOptions.find((item) => item.id === key);
            if (role && ceilings.includes(role.id)) onCeilingChange(role.id);
          }}
        >
          <Label>Role</Label>
          <Select.Trigger>
            <Select.Value className="flex min-w-0 flex-1 items-center gap-2">
              {selected?.icon}
              <span className="truncate">{selected?.label}</span>
            </Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {teamRoleOptions.map((role) => (
                <ListBox.Item
                  id={role.id}
                  key={role.id}
                  textValue={`${role.label} ${role.description ?? ""}`}
                >
                  {role.icon}
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span>{role.label}</span>
                    <span className="text-xs text-muted">
                      {role.description}
                    </span>
                  </span>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        {workspace ? (
          <Select
            aria-label={workspace.label ?? "Workspace"}
            variant="primary"
            isRequired
            selectedKey={workspace.value || null}
            isDisabled={disabled}
            onSelectionChange={(key) => {
              const option = workspace.options.find((item) => item.id === key);
              if (option) workspace.onChange(option.id);
            }}
          >
            <Label isRequired>{workspace.label ?? "Workspace"}</Label>
            <Select.Trigger>
              <Select.Value className="truncate" />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {workspace.options.map((option) => (
                  <ListBox.Item
                    id={option.id}
                    key={option.id}
                    textValue={option.label}
                  >
                    <span className="min-w-0 flex-1">{option.label}</span>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        ) : null}
        <p className="text-muted">
          It acts with the lower of this role and your own
          {highest ? ` (${highest.label})` : ""}. If your role changes in your
          identity provider, the connection follows it.
        </p>
        {approvalBlockedReason != null && (
          <p role="alert" className="text-sm text-danger">
            {approvalBlockedReason}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            isDisabled={disabled}
            onPress={onDeny}
          >
            Deny
          </Button>
          <Button
            type="submit"
            isDisabled={disabled || approvalBlocked}
            isPending={isPending}
          >
            Approve
          </Button>
        </div>
        <AuthAction
          className="max-w-full text-left [overflow-wrap:anywhere]"
          disabled={disabled}
          onClick={onDeny}
        >
          Back to {presented.name}
        </AuthAction>
      </form>
    </AuthScreen>
  );
}
