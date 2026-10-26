// @dsCard group="Account settings" height=288
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
mount(
  <div style={{ padding: 16 }}>
    <A.PasskeySettings
      items={[
        {
          id: "key-1",
          name: "MacBook Touch ID",
          createdAt: "2026-09-14T00:00:00Z",
        },
        {
          id: "key-2",
          name: "Security key",
          createdAt: "2026-10-06T00:00:00Z",
        },
      ]}
      formatDate={formatDate}
      onAdd={async () => {}}
      onRename={async () => {}}
      onRemove={async () => {}}
      onReplaceRecoveryCodes={async () => {}}
      recoveryCodes={[]}
      onDismissRecoveryCodes={() => {}}
    />
  </div>,
);
