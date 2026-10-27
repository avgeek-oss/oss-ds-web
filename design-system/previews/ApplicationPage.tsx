// @dsCard group="Layouts" height=376 width=960
import * as React from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
function Example() {
  const [name, setName] = React.useState("Avgeek");
  return (
    <A.AppShell
      policy={{ kind: "product", toasts: false }}
      contentWidth="compact"
    >
      <A.AppShell.Content>
        <A.ApplicationPage
          title="General"
          titleContent={<A.SettingsPageTitle section="general" />}
          description="Name and details shown to everyone on this team."
          breadcrumbAncestors={[
            { label: "Team settings", href: "/team/general" },
          ]}
          actions={<A.Button variant="secondary">Leave team</A.Button>}
        >
          <A.NameSettingsForm
            title="Team details"
            label="Team name"
            value={name}
            onSave={async (value: string) => setName(value)}
          />
        </A.ApplicationPage>
      </A.AppShell.Content>
    </A.AppShell>
  );
}
mount(<Example />);
