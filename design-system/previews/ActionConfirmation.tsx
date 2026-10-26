// @dsCard group="Overlays" height=272
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <A.ActionConfirmation
    isOpen
    onOpenChange={() => {}}
    title="Remove member?"
    description="Their access to this team will be removed immediately."
    confirmLabel="Remove member"
    onConfirm={() => new Promise<void>(() => {})}
  />,
);
