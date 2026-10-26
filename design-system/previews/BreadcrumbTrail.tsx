// @dsCard group="Navigation" height=112
import * as React from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
function Example() {
  const [section, setSection] = React.useState("Profile");
  return (
    <div style={{ display: "grid", gap: 20, padding: 16 }}>
      <A.BreadcrumbTrail
        items={[
          { label: "Team settings", href: "/team/general" },
          { label: "Members", href: "/team/members" },
          { label: "Alex Taylor" },
        ]}
      />
      <A.BreadcrumbTrail
        items={[
          {
            label: section,
            content: (
              <A.BreadcrumbDropdown.Root>
                <A.BreadcrumbDropdown.Trigger aria-label="Switch account page">
                  {section}
                </A.BreadcrumbDropdown.Trigger>
                <A.BreadcrumbDropdown.Popover placement="bottom start">
                  <A.BreadcrumbDropdown.Menu
                    aria-label="Account pages"
                    selectionMode="single"
                    selectedKeys={[section]}
                    onAction={(key) => setSection(String(key))}
                  >
                    {["Profile", "Preferences", "Passkeys"].map((s) => (
                      <A.BreadcrumbDropdown.Item key={s} id={s} textValue={s}>
                        {s}
                        <A.BreadcrumbDropdown.ItemIndicator />
                      </A.BreadcrumbDropdown.Item>
                    ))}
                  </A.BreadcrumbDropdown.Menu>
                </A.BreadcrumbDropdown.Popover>
              </A.BreadcrumbDropdown.Root>
            ),
          },
          { label: "Edit name" },
        ]}
      />
    </div>
  );
}
mount(<Example />);
