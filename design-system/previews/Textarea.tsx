// @dsCard group="Forms" height=296
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const panel = { background: "var(--surface)", borderRadius: 16, padding: 16 };
mount(
  <div style={{ padding: 16, display: "grid", gap: 16, maxWidth: 448 }}>
    <A.Textarea
      aria-label="Description"
      rows={3}
      placeholder="What does this integration do?"
    />
    <A.Textarea
      aria-label="Invalid description"
      rows={2}
      aria-invalid
      defaultValue="Too short"
    />
    <div style={panel}>
      <A.Textarea
        aria-label="Notes"
        variant="secondary"
        rows={2}
        defaultValue="Rotates the staging deploy key every 90 days."
        style={{ width: "100%" }}
      />
    </div>
  </div>,
);
