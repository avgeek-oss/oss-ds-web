// @dsCard group="Team settings" height=272 width=880
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ padding: 16 }}>
    <A.MembersTable
      items={[
        {
          id: "alex",
          name: "Alex Taylor",
          email: "alex@example.test",
          role: "admin",
          accountStatus: { label: "Active", color: "success" },
          securityStatus: { label: "Enabled", color: "success" },
        },
        {
          id: "priya",
          name: "Priya Nair",
          email: "priya@example.test",
          role: "member",
          accountStatus: { label: "Active", color: "success" },
          securityStatus: { label: "Enabled", color: "success" },
        },
        {
          id: "sam",
          name: "Sam Chen",
          email: "sam@example.test",
          role: "viewer",
          accountStatus: { label: "Password setup pending", color: "warning" },
          securityStatus: { label: "Not enabled", color: "warning" },
        },
      ]}
      roles={A.teamRoleOptions}
      currentUserId="alex"
      actions={() => <A.Button variant="secondary">Edit</A.Button>}
    />
  </div>,
);
