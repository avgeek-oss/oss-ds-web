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
          ceiling: "admin",
          workspace: null,
          createdAt: "2026-10-01T00:00:00Z",
          expiresAt: "2099-12-30T00:00:00Z",
          lastUsedAt: "2026-10-06T00:00:00Z",
          replacedBy: null,
          graceUntil: null,
        },
        {
          id: "reporting",
          name: "Reporting",
          ceiling: "viewer",
          workspace: null,
          createdAt: "2026-09-01T00:00:00Z",
          expiresAt: null,
          lastUsedAt: null,
          replacedBy: null,
          graceUntil: null,
        },
      ]}
      formatDate={formatDate}
      onRotate={async () => ({ key: "preview" })}
      onRevoke={async () => {}}
    />
  </div>,
);
