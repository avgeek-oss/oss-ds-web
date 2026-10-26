// @dsCard group="Forms" height=152
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const panel = { background: "var(--surface)", borderRadius: 16, padding: 16 };
mount(
  <div style={{ padding: 16, display: "grid", gap: 16, maxWidth: 448 }}>
    <A.InputGroup fullWidth>
      <A.InputGroup.Prefix>https://</A.InputGroup.Prefix>
      <A.InputGroup.Input
        aria-label="Webhook URL"
        placeholder="hooks.example.com/avgeek"
      />
    </A.InputGroup>
    <div style={panel}>
      <A.InputGroup variant="secondary" fullWidth>
        <A.InputGroup.Input
          aria-label="Search events"
          type="search"
          placeholder="Search events"
        />
        <A.InputGroup.Suffix>⌘ K</A.InputGroup.Suffix>
      </A.InputGroup>
    </div>
  </div>,
);
