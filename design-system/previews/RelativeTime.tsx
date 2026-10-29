// @dsCard group="Data display" height=144
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const formatAbsolute = (value: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(value);
const ago = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();
mount(
  <div style={{ padding: 16, display: "grid", gap: 16 }}>
    <A.RelativeTime
      value={ago(5)}
      label="Last synced"
      formatAbsolute={formatAbsolute}
      timeZone="UTC"
    />
    <A.RelativeTime
      value={ago(90)}
      label="Last synced"
      display="relative"
      formatAbsolute={formatAbsolute}
      timeZone="UTC"
    />
    <A.RelativeTime
      value={ago(4320)}
      label="Created"
      display="compact"
      formatAbsolute={formatAbsolute}
      timeZone="UTC"
    />
  </div>,
);
