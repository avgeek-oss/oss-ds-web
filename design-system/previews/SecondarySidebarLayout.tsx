// @dsCard group="Navigation" height=384 width=1100
import * as React from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
function Example() {
  const [selected, setSelected] = React.useState("profile");
  const [sort, setSort] = React.useState("newest");
  return (
    <A.SecondarySidebarLayout>
      <A.SecondaryItems
        title="Account"
        selected={selected}
        onSelect={setSelected}
        items={[
          { id: "profile", label: "Profile" },
          { id: "preferences", label: "Preferences" },
          { id: "passkeys", label: "Passkeys", badge: "2" },
          {
            id: "locked",
            label: "Billing",
            disabled: true,
            disabledReason: "Available to team admins",
          },
        ]}
      />
      <A.SecondarySection title="Sort tasks">
        <A.ChoiceField
          label="Sort order"
          value={sort}
          onChange={setSort}
          options={[
            { id: "newest", label: "Newest first" },
            { id: "title", label: "Title" },
          ]}
        />
      </A.SecondarySection>
      <div style={{ padding: 24, fontSize: 14 }}>
        Page content for <strong>{selected}</strong> sits beside the secondary
        sidebar.
      </div>
    </A.SecondarySidebarLayout>
  );
}
mount(<Example />);
