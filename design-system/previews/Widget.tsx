// @dsCard group="Data display" height=272
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div
    style={{
      display: "grid",
      gap: 16,
      padding: 16,
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    }}
  >
    <A.Widget>
      <A.Widget.Header endContent={<A.Widget.Action>View all</A.Widget.Action>}>
        <A.Widget.Title>Deployments</A.Widget.Title>
      </A.Widget.Header>
      <A.Widget.Content>
        <div
          style={{
            fontSize: 24,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          128
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>Last 7 days</div>
      </A.Widget.Content>
    </A.Widget>
    <A.Widget>
      <A.Widget.Header>
        <A.Widget.Title>Requests</A.Widget.Title>
      </A.Widget.Header>
      <A.Widget.Content>
        <A.Widget.Legend>
          <A.Widget.LegendItem color="var(--chart-requested)">
            Requested
          </A.Widget.LegendItem>
          <A.Widget.LegendItem color="var(--chart-succeeded)">
            Succeeded
          </A.Widget.LegendItem>
          <A.Widget.LegendItem color="var(--chart-failed)">
            Failed
          </A.Widget.LegendItem>
        </A.Widget.Legend>
      </A.Widget.Content>
      <A.Widget.Footer>
        <A.Widget.FooterDescription>
          Updated 2 minutes ago
        </A.Widget.FooterDescription>
        <A.Widget.Action>Refresh</A.Widget.Action>
      </A.Widget.Footer>
    </A.Widget>
    <A.Widget>
      <A.Widget.Content>
        Content-only widgets hold a single form or metric without a title row.
      </A.Widget.Content>
    </A.Widget>
  </div>,
);
