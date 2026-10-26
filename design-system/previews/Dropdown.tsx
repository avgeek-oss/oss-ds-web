// @dsCard group="Overlays" height=208
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ padding: 16 }}>
    <A.Dropdown defaultOpen>
      <A.Dropdown.Trigger className="button button--secondary button--sm">
        Member actions
      </A.Dropdown.Trigger>
      <A.Dropdown.Popover placement="bottom start">
        <A.Dropdown.Menu aria-label="Member actions">
          <A.Dropdown.Item id="role" textValue="Change role">
            Change role
          </A.Dropdown.Item>
          <A.Dropdown.Item id="resend" textValue="Resend invitation" isDisabled>
            Resend invitation
          </A.Dropdown.Item>
          <A.Dropdown.Item
            id="remove"
            textValue="Remove member"
            variant="danger"
            className="text-danger"
          >
            Remove member
          </A.Dropdown.Item>
        </A.Dropdown.Menu>
      </A.Dropdown.Popover>
    </A.Dropdown>
  </div>,
);
