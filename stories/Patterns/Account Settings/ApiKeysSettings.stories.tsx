import type { Meta, StoryObj } from "@storybook/react-vite";
import { ApiKeysSettingsPreview } from "../../../studio/pattern-previews";
import { Button } from "../../../src/buttons/button";
import { useState } from "react";
import { ApiKeysSettings } from "../../../src/patterns/account-settings/api-keys-settings";
import type { ApiKey } from "../../../src/patterns/account-settings/api-keys-table";
import {
  TableCellStack,
  TableCellDescription,
} from "../../../src/data-display/table-cell-text";

const base = {
  workspace: null,
  createdAt: "2026-10-01",
  lastUsedAt: null,
  replacedBy: null,
  graceUntil: null,
} as const;
const keys: ApiKey[] = [
  {
    ...base,
    id: "automation",
    name: "Automation key with a long identifiable name for release operations",
    ceiling: "member",
    expiresAt: "2099-12-30",
    lastUsedAt: "2026-10-06",
  },
  {
    ...base,
    id: "reporting",
    name: "Reporting",
    ceiling: "viewer",
    expiresAt: null,
  },
  {
    ...base,
    id: "expired",
    name: "Previous integration",
    ceiling: "viewer",
    expiresAt: "2000-01-01",
  },
];

function ResponsiveApiKeys() {
  const [items, setItems] = useState(keys);
  const [requests, setRequests] = useState(0);
  return (
    <div className="grid min-w-0 gap-4 p-4">
      <h1 className="text-lg font-medium">API keys</h1>
      <p className="text-xs text-muted">Simulated requests: {requests}</p>
      <ApiKeysSettings
        items={items}
        formatDate={(value) => (
          <TableCellStack>
            <time dateTime={value}>{value}</time>
            <TableCellDescription>
              At 16:15 in your time zone
            </TableCellDescription>
          </TableCellStack>
        )}
        onRevoke={async (id) => {
          const attempt = requests + 1;
          setRequests(attempt);
          await new Promise((resolve) => setTimeout(resolve, 600));
          if (attempt === 1)
            throw new Error("Revocation failed. Please retry.");
          setItems((current) => current.filter((item) => item.id !== id));
        }}
      />
    </div>
  );
}

function FocusReturnExample() {
  return (
    <div className="grid gap-4 p-4">
      <Button variant="secondary">Other action</Button>
      <ApiKeysSettings
        items={[
          {
            ...base,
            id: "automation",
            name: "Automation",
            ceiling: "member",
            expiresAt: null,
          },
        ]}
        formatDate={(value) => value}
        onRevoke={async () => {}}
      />
    </div>
  );
}

const meta = {
  title: "Patterns/Account Settings/ApiKeysSettings",
  component: ApiKeysSettings,
  parameters: {
    docs: {
      description: {
        component:
          "Use the published ApiKeysSettings component from @avgeek-oss/design-system/patterns/account-settings/api-keys-settings. Keys carry a role ceiling (the key acts with the lower of it and the owner's role), an optional workspace and an expiry, and rotate with a grace period. Applications own the requests; ConnectedApiKeysSettings does them with an AuthClient.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <ApiKeysSettingsPreview />,
};

export const FocusReturn: Story = {
  name: "Focus return",
  render: () => <FocusReturnExample />,
};

export const ResponsiveDetails: Story = {
  name: "Responsive details",
  render: () => <ResponsiveApiKeys />,
};
