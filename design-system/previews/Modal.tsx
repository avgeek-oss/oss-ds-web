// @dsCard group="Overlays" height=320
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <A.Modal.Backdrop isOpen onOpenChange={() => {}}>
    <A.Modal.Container size="sm">
      <A.Modal.Dialog>
        <A.Modal.Header>
          <A.Modal.Heading>Create invitation</A.Modal.Heading>
          <A.Modal.CloseTrigger />
        </A.Modal.Header>
        <A.Modal.Body>
          <p style={{ margin: "0 0 16px", fontSize: 14 }}>
            Invite a teammate by email. The link expires after seven days.
          </p>
          <A.Input
            variant="secondary"
            aria-label="Email"
            placeholder="name@example.com"
            style={{ width: "100%" }}
          />
        </A.Modal.Body>
        <A.Modal.Footer>
          <A.Button variant="secondary">Cancel</A.Button>
          <A.Button>Create invitation</A.Button>
        </A.Modal.Footer>
      </A.Modal.Dialog>
    </A.Modal.Container>
  </A.Modal.Backdrop>,
);
