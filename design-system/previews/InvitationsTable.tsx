// @dsCard group="Team settings" height=216 width=880
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
mount(
  <div style={{ padding: 16 }}>
    <A.InvitationsTable
      items={[
        {
          id: "inv-1",
          email: "jordan@example.test",
          role: "member",
          expiresAt: "2026-11-02T10:00:00Z",
        },
        {
          id: "inv-2",
          email: "kai@example.test",
          name: "Kai Morgan",
          role: "viewer",
          expiresAt: "2026-10-30T10:00:00Z",
        },
      ]}
      roles={A.teamRoleOptions}
      formatDate={formatDate}
      onCopyLink={async () => {}}
      onResend={async () => {}}
      onRevoke={async () => {}}
    />
  </div>,
);
