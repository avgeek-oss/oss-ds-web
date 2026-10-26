// @dsCard group="Actions" height=96
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div className="flex flex-wrap items-center gap-3 p-4">
    <A.Button variant="primary">Save changes</A.Button>
    <A.Button variant="secondary">Cancel</A.Button>
    <A.Button variant="tertiary">Learn more</A.Button>
    <A.Button variant="ghost">Skip</A.Button>
    <A.Button variant="danger">Delete team</A.Button>
    <A.Button variant="danger-soft">Revoke</A.Button>
    <A.Button variant="primary" isDisabled>
      Disabled
    </A.Button>
  </div>,
);
