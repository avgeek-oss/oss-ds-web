// @dsCard group="Data display" height=272
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const items = [
  { id: "ksfo", label: "San Francisco", description: "KSFO · 4 runways" },
  { id: "kjfk", label: "New York JFK", description: "KJFK · 4 runways" },
];
mount(
  <div style={{ display: "grid", gap: 16, padding: 16, maxWidth: 520 }}>
    <A.ListView items={items} aria-label="Airports">
      {(item) => (
        <A.ListView.Item
          key={item.id}
          id={item.id}
          href={`#${item.id}`}
          textValue={item.label}
        >
          <A.ListView.ItemContent>
            <span style={{ display: "grid" }}>
              <A.ListView.Title>{item.label}</A.ListView.Title>
              <A.ListView.Description>
                {item.description}
              </A.ListView.Description>
            </span>
          </A.ListView.ItemContent>
        </A.ListView.Item>
      )}
    </A.ListView>
    <A.ListView
      items={[]}
      aria-label="Saved routes"
      renderEmptyState={() => (
        <p
          style={{
            padding: 20,
            fontSize: 14,
            color: "var(--muted)",
            margin: 0,
          }}
        >
          No saved routes yet.
        </p>
      )}
    >
      {() => null}
    </A.ListView>
  </div>,
);
