// @dsCard group="Feedback" height=424
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const alerts = [
  ["default", "Maintenance window", "Scheduled for Sunday 02:00–03:00 UTC."],
  ["accent", "New version available", "Reload to get the latest dashboard."],
  ["success", "Deployment complete", "All 12 services are healthy."],
  ["warning", "API key expiring", "CI deploy expires in 7 days."],
  [
    "danger",
    "Access restricted",
    "Ask an administrator to grant access to this team.",
  ],
] as const;
mount(
  <div style={{ display: "grid", gap: 12, padding: 16, maxWidth: 560 }}>
    {alerts.map(([status, title, description]) => (
      <A.Alert key={status} status={status}>
        <A.Alert.Indicator />
        <A.Alert.Content>
          <A.Alert.Title>{title}</A.Alert.Title>
          <A.Alert.Description>{description}</A.Alert.Description>
        </A.Alert.Content>
      </A.Alert>
    ))}
  </div>,
);
