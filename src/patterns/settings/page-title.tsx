import type { JSX } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import ComputerIcon from "@hugeicons/core-free-icons/ComputerIcon";
import Key01Icon from "@hugeicons/core-free-icons/Key01Icon";
import McpServerIcon from "@hugeicons/core-free-icons/McpServerIcon";
import Mail01Icon from "@hugeicons/core-free-icons/Mail01Icon";
import FingerPrintIcon from "@hugeicons/core-free-icons/FingerPrintIcon";
import Settings01Icon from "@hugeicons/core-free-icons/Settings01Icon";
import UserAccountIcon from "@hugeicons/core-free-icons/UserAccountIcon";
import UserGroupIcon from "@hugeicons/core-free-icons/UserGroupIcon";

export const settingsPageLabels = {
  profile: "Profile",
  preferences: "Preferences",
  "email-password": "Email & Password",
  passkeys: "Passkeys",
  sessions: "Sessions",
  "api-keys": "API Keys",
  "mcp-connections": "MCP Connections",
  mcp: "MCP Guide",
  members: "Members",
  general: "General",
} as const;
export type CommonSettingsSection = keyof typeof settingsPageLabels;
const icons = {
  profile: UserAccountIcon,
  preferences: Settings01Icon,
  "email-password": Mail01Icon,
  passkeys: FingerPrintIcon,
  sessions: ComputerIcon,
  "api-keys": Key01Icon,
  "mcp-connections": McpServerIcon,
  mcp: McpServerIcon,
  members: UserGroupIcon,
  general: Settings01Icon,
};
export function SettingsPageTitle({
  section,
}: {
  section: CommonSettingsSection;
}): JSX.Element {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <HugeiconsIcon
        icon={icons[section]}
        size={19}
        className="shrink-0"
        aria-hidden="true"
      />
      <span>{settingsPageLabels[section]}</span>
    </span>
  );
}
