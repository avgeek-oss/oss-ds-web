// @dsCard group="Data display" height=432
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ display: "grid", gap: 16, padding: 16, maxWidth: 560 }}>
    <A.EmptyState>
      <A.EmptyState.Header>
        <A.EmptyState.Title>No API keys</A.EmptyState.Title>
        <A.EmptyState.Description>
          Create an API key for your scripts or apps.
        </A.EmptyState.Description>
      </A.EmptyState.Header>
      <A.EmptyState.Content>
        <A.Button>Create API key</A.Button>
      </A.EmptyState.Content>
    </A.EmptyState>
    <A.Widget>
      <A.Widget.Header>
        <A.Widget.Title>Sessions</A.Widget.Title>
      </A.Widget.Header>
      <A.Widget.Content>
        <A.EmptyState>
          <A.EmptyState.Header>
            <A.EmptyState.Title>No other sessions</A.EmptyState.Title>
          </A.EmptyState.Header>
        </A.EmptyState>
      </A.Widget.Content>
    </A.Widget>
  </div>,
);
