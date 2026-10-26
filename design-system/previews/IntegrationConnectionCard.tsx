// @dsCard group="Data patterns" height=272
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ padding: 16, maxWidth: 560 }}>
    <A.IntegrationConnectionCard
      provider={{ name: "GitLab" }}
      connection={{
        id: "account",
        status: { label: "Connected", color: "success" },
        details: [
          { id: "account", label: "Account", value: "Alex Taylor" },
          { id: "identity", label: "Identity", value: "alex@example.test" },
          { id: "auth", label: "Authorization", value: "OAuth 2.0" },
        ],
      }}
      emptyDescription="Authorize access to the repositories used by your team."
      disconnectDescription="Existing repositories will stop syncing and cannot deploy until the connection is authorized again."
      onConnect={async () => {}}
      onReauthorize={async () => {}}
      onDisconnect={async () => {}}
    />
  </div>,
);
