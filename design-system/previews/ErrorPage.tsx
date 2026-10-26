// @dsCard group="Feedback" height=384
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    }}
  >
    <A.ErrorPage
      status="not-found"
      returnHref="/"
      returnLabel="Go to overview"
      style={{ minHeight: 0 }}
    />
    <A.ErrorPage
      status="server-error"
      onRetry={() => {}}
      returnHref="/"
      returnLabel="Go to overview"
      style={{ minHeight: 0 }}
    />
  </div>,
);
