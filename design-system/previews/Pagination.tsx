// @dsCard group="Navigation" height=136
import * as React from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
function Example() {
  const [page, setPage] = React.useState(4);
  const [cursor, setCursor] = React.useState(1);
  return (
    <div
      style={{ display: "grid", gap: 16, padding: 16, justifyItems: "start" }}
    >
      <A.Pagination page={page} totalPages={12} onPageChange={setPage} />
      <A.Pagination
        page={cursor}
        totalPages={null}
        hasNextPage={cursor < 5}
        onPageChange={setCursor}
      />
    </div>
  );
}
mount(<Example />);
