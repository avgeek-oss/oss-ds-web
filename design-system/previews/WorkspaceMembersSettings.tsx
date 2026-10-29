// @dsCard group="Team settings" height=320
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const people = [
  {
    id: "ada",
    name: "Ada Lovelace",
    email: "ada@avgeek.dev",
    role: "admin" as const,
    roleSource: "scim" as const,
    lastSignInAt: "2026-10-26T08:10:00Z",
  },
  {
    id: "sam",
    name: "Sam Chen",
    email: "sam@avgeek.dev",
    role: "member" as const,
    roleSource: "scim" as const,
    lastSignInAt: null,
  },
];
mount(
  <div style={{ padding: 16 }}>
    <A.WorkspaceMembersSettings
      workspaceName="Operations"
      providerName="authentik"
      members={people.slice(0, 1)}
      people={people}
      formatDate={(value) => value.slice(0, 10)}
      onAdd={async () => {}}
      onRemove={async () => {}}
    />
  </div>,
);
