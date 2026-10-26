// @dsCard group="Pickers" height=200
import type { ComponentProps } from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const members = [
  "Ada Lovelace",
  "Grace Hopper",
  "Katherine Johnson",
  "Margaret Hamilton",
];
const panel = { background: "var(--surface)", borderRadius: 16, padding: 16 };
function Member(props: ComponentProps<typeof A.Autocomplete>) {
  return (
    <A.Autocomplete {...props}>
      <A.Label>Assign to</A.Label>
      <A.Autocomplete.Trigger>
        <A.Autocomplete.Value />
        <A.Autocomplete.Indicator />
      </A.Autocomplete.Trigger>
      <A.Autocomplete.Popover>
        <A.Autocomplete.Filter
          filter={(text: string, search: string) =>
            text.toLowerCase().includes(search.toLowerCase())
          }
        >
          <A.SearchField aria-label="Search members" variant="secondary">
            <A.SearchField.Group>
              <A.SearchField.SearchIcon />
              <A.SearchField.Input placeholder="Search members" />
              <A.SearchField.ClearButton />
            </A.SearchField.Group>
          </A.SearchField>
          <A.ListBox>
            {members.map((name) => (
              <A.ListBox.Item id={name} key={name} textValue={name}>
                {name}
                <A.ListBox.ItemIndicator />
              </A.ListBox.Item>
            ))}
          </A.ListBox>
        </A.Autocomplete.Filter>
      </A.Autocomplete.Popover>
    </A.Autocomplete>
  );
}
mount(
  <div style={{ padding: 16, display: "grid", gap: 16, maxWidth: 448 }}>
    <Member defaultSelectedKey="Grace Hopper" />
    <div style={panel}>
      <Member variant="secondary" />
    </div>
  </div>,
);
