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
    <A.SessionsSettings
      items={[
        {
          id: "ses_01J9X4KQ",
          name: "Safari on macOS",
          lastActive: "2026-10-26T08:10:00Z",
          expiresAt: "2026-11-02T00:00:00Z",
          current: true,
        },
        {
          id: "ses_01J8T2MW",
          name: "Chrome on Windows",
          lastActive: "2026-10-24T17:42:00Z",
          expiresAt: "2026-10-31T00:00:00Z",
          current: false,
        },
      ]}
      formatDate={formatDate}
      onRevoke={async () => {}}
    />
  </div>,
);
