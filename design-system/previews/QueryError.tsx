// @dsCard group="Feedback" height=104
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ padding: 16 }}>
    <A.QueryLoading>Loading sessions…</A.QueryLoading>
    <A.QueryError
      message="Could not load sessions. Try again."
      onRetry={() => {}}
    />
  </div>,
);
