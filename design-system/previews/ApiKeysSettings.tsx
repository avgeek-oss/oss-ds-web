// @dsCard group="Account settings" height=208
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
mount(
  <div style={{ padding: 16 }}>
    <A.ApiKeysSettings
      items={[
        {
          id: "automation",
          name: "Release automation",
          tokenHint: "key_••••12ab",
          permissions: "Read and write boards and tasks",
          createdAt: "2026-10-01T00:00:00Z",
          expiresAt: "2099-12-30T00:00:00Z",
          lastUsedAt: "2026-10-06T00:00:00Z",
        },
        {
          id: "reporting",
          name: "Reporting",
          permissions: "Read only",
          expiresAt: null,
          lastUsedAt: null,
        },
      ]}
      formatDate={formatDate}
      onRevoke={async () => {}}
    />
  </div>,
);
