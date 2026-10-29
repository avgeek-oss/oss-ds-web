// @dsCard group="Team settings" height=360
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
mount(
  <div style={{ padding: 16 }}>
    <A.PeopleDirectory
      providerName="authentik"
      currentUserId="ada"
      formatDate={formatDate}
      items={[
        {
          id: "ada",
          name: "Ada Lovelace",
          email: "ada@avgeek.dev",
          role: "admin",
          roleSource: "scim",
          lastSignInAt: "2026-10-26T08:10:00Z",
        },
        {
          id: "sam",
          name: "Sam Chen",
          email: "sam@avgeek.dev",
          role: "member",
          roleSource: "scim",
          lastSignInAt: "2026-10-24T17:42:00Z",
        },
        {
          id: "lee",
          name: "Lee Okafor",
          email: "lee@avgeek.dev",
          role: null,
          roleSource: "scim",
          lastSignInAt: null,
        },
      ]}
    />
  </div>,
);
