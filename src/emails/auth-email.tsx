import type { JSX } from "react";
import {
  EmailShell,
  type EmailBrand,
  type EmailDetail,
  type EmailMessage,
} from "./email-shell.js";
export const authEmailTemplates = ["role-changed", "access-removed"] as const;
export type AuthEmailTemplate = (typeof authEmailTemplates)[number];
export type AuthEmailData = {
  brand: EmailBrand;
  name?: string;
  teamName?: string;
  /** Where the person manages access, such as "authentik". */
  providerName?: string;
  actionUrl?: string;
  role?: string;
  details?: readonly EmailDetail[];
};
export function authEmailMessage(
  template: AuthEmailTemplate,
  data: AuthEmailData,
): EmailMessage {
  const role =
    data.role === "admin"
      ? "Admin"
      : data.role === "viewer"
        ? "Viewer"
        : "Member";
  const access =
    data.role === "admin"
      ? "Manage the team and its resources."
      : data.role === "viewer"
        ? "View team resources."
        : "Create and update team resources.";
  const team = data.teamName ?? data.brand.name;
  const app = data.brand.name;
  const provider = data.providerName ?? "your organisation's identity provider";
  const messages: Record<
    AuthEmailTemplate,
    Pick<EmailMessage, "title" | "paragraphs" | "actionLabel">
  > = {
    "role-changed": {
      title: "Your team access changed",
      paragraphs: [
        ...(data.role
          ? [`Your role in ${team} is now ${role}.`, access]
          : [`Your role in ${team} changed.`]),
        `API keys and connected apps limited to a higher role were revoked. Roles are managed in ${provider}; ask an administrator there if this was unexpected.`,
      ],
      actionLabel: `Open ${app}`,
    },
    "access-removed": {
      title: "Your team access was removed",
      paragraphs: [
        `Your access to ${team} was removed in ${provider}. Your sessions, API keys and connected apps have been revoked.`,
        "Contact an administrator if this was unexpected.",
      ],
    },
  };
  return {
    ...messages[template],
    name: data.name,
    details: data.details,
    teamName: team,
    actionUrl: data.actionUrl,
  };
}
export interface AuthEmailProps {
  template: AuthEmailTemplate;
  data: AuthEmailData;
}
export function AuthEmail({ template, data }: AuthEmailProps): JSX.Element {
  return (
    <EmailShell brand={data.brand} message={authEmailMessage(template, data)} />
  );
}
