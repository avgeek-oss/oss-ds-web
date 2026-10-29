"use client";

import { Widget } from "../../data-display/widget.js";
import { Attributes } from "../../data-display/attributes.js";
import { InlineExternalLink } from "../../navigation/inline-external-link.js";
import { UserAvatar } from "../user-avatar.js";
import {
  teamRoleOptions,
  type TeamRole,
} from "../team-settings/team-role-options.js";

export type ProfileSettingsProps = {
  /** Display name from the identity provider, or `null`. */
  name: string | null;
  /** Email from the identity provider, or `null`. */
  email: string | null;
  /** The organisation's identity provider, such as "authentik". */
  providerName: string;
  /** A picture the app has for the person; Gravatar by email otherwise. */
  avatarUrl?: string;
  /** The person's current role in the app. */
  role?: TeamRole;
  /** The provider's own account page, opened in a new tab. */
  manageUrl?: string;
  title?: string;
};

/** The signed-in person's profile, read-only: the provider owns it. */
export function ProfileSettings({
  name,
  email,
  providerName,
  avatarUrl,
  role,
  manageUrl,
  title = "Profile details",
}: ProfileSettingsProps) {
  const displayName = name?.trim() || email || "Unnamed";
  return (
    <Widget>
      <Widget.Header>
        <Widget.Title>{title}</Widget.Title>
      </Widget.Header>
      <Widget.Content className="grid gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar
            aria-hidden="true"
            email={email ?? ""}
            name={displayName}
            src={avatarUrl}
            size="md"
          />
          <div className="grid min-w-0 gap-0.5">
            <span className="truncate text-sm font-medium">{displayName}</span>
            {email ? (
              <span className="truncate text-sm text-muted">{email}</span>
            ) : null}
          </div>
        </div>
        <Attributes variant="embedded">
          <Attributes.Item label="Name">{name?.trim() || "—"}</Attributes.Item>
          <Attributes.Item label="Email">
            <span className="[overflow-wrap:anywhere]">{email ?? "—"}</span>
          </Attributes.Item>
          {role ? (
            <Attributes.Item label="Role">
              {teamRoleOptions.find((option) => option.id === role)?.label ??
                role}
            </Attributes.Item>
          ) : null}
        </Attributes>
        <p className="text-sm text-muted">
          Your profile and role come from {providerName} and are changed there.{" "}
          {manageUrl ? (
            <InlineExternalLink href={manageUrl}>
              Manage in {providerName}
            </InlineExternalLink>
          ) : null}
        </p>
      </Widget.Content>
    </Widget>
  );
}
