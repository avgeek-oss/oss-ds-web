// @dsCard group="Overlays" height=152
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ padding: 16 }}>
    <A.Popover defaultOpen>
      <A.Popover.Trigger className="button button--secondary button--sm">
        Release notes
      </A.Popover.Trigger>
      <A.Popover.Content placement="right">
        <A.Popover.Arrow />
        <A.Popover.Dialog>
          <A.Popover.Heading>Version 1.2.19</A.Popover.Heading>
          <p style={{ margin: "4px 0 0", fontSize: 14, maxWidth: 260 }}>
            Adds the reusable date and time range picker.
          </p>
        </A.Popover.Dialog>
      </A.Popover.Content>
    </A.Popover>
  </div>,
);
