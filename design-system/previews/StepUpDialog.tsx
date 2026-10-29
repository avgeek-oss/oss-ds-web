// @dsCard group="Auth" height=320
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <A.StepUpDialog
    isOpen
    onOpenChange={() => {}}
    providerName="authentik"
    reason="Creating an admin API key needs a recent sign-in."
    onContinue={() => {}}
  />,
);
