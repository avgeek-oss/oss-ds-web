// @dsCard group="Data patterns" height=264
import * as React from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
function History() {
  const [page, setPage] = React.useState(1);
  const items = [
    {
      id: "e1",
      event: "Member invited",
      actor: "Alex Taylor",
      at: "2026-10-06T10:00:00Z",
    },
    {
      id: "e2",
      event: "API key created",
      actor: "Priya Nair",
      at: "2026-10-05T16:24:00Z",
    },
    {
      id: "e3",
      event: "Passkey added",
      actor: "Sam Chen",
      at: "2026-10-04T08:12:00Z",
    },
  ];
  return (
    <div style={{ padding: 16 }}>
      <A.HistoryTable
        label="Audit events"
        items={items}
        columns={[
          { key: "event", header: "Event", cell: (item) => item.event },
          { key: "actor", header: "Actor", cell: (item) => item.actor },
          { key: "time", header: "Time", cell: (item) => formatDate(item.at) },
        ]}
        emptyDescription="Team activity will appear here."
        pagination={{ page, hasNextPage: page < 3, onPageChange: setPage }}
      />
    </div>
  );
}
mount(<History />);
