// @dsCard group="Charts" height=360
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const data = [
  { time: 0, requests: 35, errors: 4 },
  { time: 14400000, requests: 42, errors: 2 },
  { time: 28800000, requests: 97, errors: 8 },
  { time: 43200000, requests: 63, errors: 3 },
  { time: 57600000, requests: 78, errors: 5 },
  { time: 72000000, requests: 13, errors: 1 },
];
const label = (t: number) => `${String(t / 3600000).padStart(2, "0")}:00`;
mount(
  <div style={{ padding: 16 }}>
    <A.Widget>
      <A.Widget.Header>
        <A.Widget.Title>Requests over time</A.Widget.Title>
      </A.Widget.Header>
      <A.Widget.Content>
        <A.LineChart data={data} height={240} aria-label="Requests over time">
          <A.LineChart.Grid />
          <A.LineChart.XAxis
            dataKey="time"
            type="number"
            domain={[0, 72000000]}
            ticks={data.map((d) => d.time)}
            tickFormatter={label}
          />
          <A.LineChart.YAxis domain={[0, "auto"]} allowDecimals={false} />
          <A.LineChart.Line dataKey="requests" name="Requests" />
          <A.LineChart.Line
            dataKey="errors"
            name="HTTP errors"
            stroke="var(--chart-failed)"
          />
          <A.LineChart.Tooltip />
        </A.LineChart>
        <A.Widget.Legend>
          <A.Widget.LegendItem color="var(--chart-requested)">
            Requests
          </A.Widget.LegendItem>
          <A.Widget.LegendItem color="var(--chart-failed)">
            HTTP errors
          </A.Widget.LegendItem>
        </A.Widget.Legend>
      </A.Widget.Content>
    </A.Widget>
  </div>,
);
