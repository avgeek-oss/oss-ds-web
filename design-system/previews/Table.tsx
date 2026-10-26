// @dsCard group="Data display" height=248
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const rows = [
  { id: "ksfo", name: "San Francisco (KSFO)", count: 24 },
  { id: "egll", name: "London Heathrow (EGLL)", count: 12 },
  { id: "rjtt", name: "Tokyo Haneda (RJTT)", count: 8 },
];
mount(
  <div style={{ padding: 16 }}>
    <A.Table>
      <A.Table.ScrollContainer>
        <A.Table.Content aria-label="Stations">
          <A.Table.Header>
            <A.Table.Column isRowHeader>Station</A.Table.Column>
            <A.Table.Column style={{ textAlign: "right" }}>
              Departures
            </A.Table.Column>
          </A.Table.Header>
          <A.Table.Body renderEmptyState={() => "No stations yet."}>
            {rows.map((r) => (
              <A.Table.Row id={r.id} key={r.id}>
                <A.Table.Cell>{r.name}</A.Table.Cell>
                <A.Table.Cell
                  style={{
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {r.count}
                </A.Table.Cell>
              </A.Table.Row>
            ))}
          </A.Table.Body>
        </A.Table.Content>
      </A.Table.ScrollContainer>
      <A.Table.Footer>3 stations</A.Table.Footer>
    </A.Table>
  </div>,
);
