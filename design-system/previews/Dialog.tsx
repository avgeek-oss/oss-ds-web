// @dsCard group="Overlays" height=320
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <A.Dialog
    open
    onClose={() => {}}
    title="Rename board"
    size="sm"
    footer={
      <>
        <A.Button variant="secondary">Cancel</A.Button>
        <A.Button>Save</A.Button>
      </>
    }
  >
    <A.TextField label="Board name" defaultValue="Roadmap" />
  </A.Dialog>,
);
