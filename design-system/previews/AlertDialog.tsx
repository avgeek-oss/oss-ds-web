// @dsCard group="Overlays" height=272
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <A.AlertDialog.Backdrop isOpen onOpenChange={() => {}}>
    <A.AlertDialog.Container size="sm">
      <A.AlertDialog.Dialog>
        <A.AlertDialog.Header>
          <A.AlertDialog.Heading>Revoke session?</A.AlertDialog.Heading>
          <A.AlertDialog.CloseTrigger />
        </A.AlertDialog.Header>
        <A.AlertDialog.Body>
          <p style={{ margin: 0, fontSize: 14 }}>
            That browser will lose access immediately and must sign in again.
          </p>
        </A.AlertDialog.Body>
        <A.AlertDialog.Footer>
          <A.Button variant="secondary">Cancel</A.Button>
          <A.Button variant="danger">Revoke session</A.Button>
        </A.AlertDialog.Footer>
      </A.AlertDialog.Dialog>
    </A.AlertDialog.Container>
  </A.AlertDialog.Backdrop>,
);
