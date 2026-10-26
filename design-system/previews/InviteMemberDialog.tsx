// @dsCard group="Team settings" height=440
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <A.InviteMemberDialog
    isOpen
    onOpenChange={() => {}}
    roles={A.teamRoleOptions}
    resultGuidance={
      <p>Email delivery is not configured. Share the link privately.</p>
    }
    onInvite={async () => ({ inviteUrl: "https://example.test/invite/demo" })}
  />,
);
