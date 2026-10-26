// @dsCard group="Feedback" height=64
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 8,
      padding: 16,
    }}
  >
    <A.StatusIndicator label="Waiting" />
    <A.StatusIndicator
      label="Running"
      color="accent"
      icon={<A.Spinner color="current" size="sm" />}
    />
    <A.StatusIndicator label="Succeeded" color="success" />
    <A.StatusIndicator
      label="Degraded"
      color="warning"
      description="2 of 12 services report elevated latency."
    />
    <A.StatusIndicator label="Failed" color="danger" />
  </div>,
);
