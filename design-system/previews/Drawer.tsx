// @dsCard group="Overlays" height=320
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <A.Drawer defaultOpen>
    <A.Drawer.Trigger className="button button--secondary button--sm">
      Event details
    </A.Drawer.Trigger>
    <A.Drawer.Backdrop>
      <A.Drawer.Content placement="right">
        <A.Drawer.Dialog>
          <A.Drawer.Header>
            <A.Drawer.Heading>Deployment completed</A.Drawer.Heading>
            <A.Drawer.CloseTrigger />
          </A.Drawer.Header>
          <A.Drawer.Body>
            <p style={{ margin: 0, fontSize: 14 }}>
              Example Website · production is running release 2026.10.26.
            </p>
          </A.Drawer.Body>
        </A.Drawer.Dialog>
      </A.Drawer.Content>
    </A.Drawer.Backdrop>
  </A.Drawer>,
);
