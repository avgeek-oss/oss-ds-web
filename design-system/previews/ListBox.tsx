// @dsCard group="Pickers" height=200
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const teams = [
  { id: "ops", label: "Avgeek Ops", detail: "12 members" },
  { id: "dev", label: "Platform engineering", detail: "24 members" },
  {
    id: "long",
    label: "A longer team name that truncates when space is limited",
    detail: "1,234 members",
  },
  { id: "archived", label: "Archived team", detail: "0 members" },
];
mount(
  <div style={{ padding: 16, maxWidth: 448 }}>
    <A.ListBox
      aria-label="Teams"
      selectionMode="single"
      defaultSelectedKeys={["ops"]}
      disabledKeys={["archived"]}
    >
      {teams.map(({ id, label, detail }) => (
        <A.ListBox.Item id={id} key={id} textValue={label}>
          <span
            style={{
              display: "flex",
              minWidth: 0,
              flex: 1,
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
            <span
              style={{
                marginLeft: "auto",
                flexShrink: 0,
                color: "var(--muted)",
              }}
            >
              {detail}
            </span>
          </span>
          <A.ListBox.ItemIndicator />
        </A.ListBox.Item>
      ))}
    </A.ListBox>
  </div>,
);
