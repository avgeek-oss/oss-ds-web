// @dsCard group="Actions" height=72
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 1500));
mount(
  <div
    style={{
      padding: 16,
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 12,
    }}
  >
    <A.AsyncActionButton onAction={wait}>Save changes</A.AsyncActionButton>
    <A.AsyncActionButton
      variant="danger-soft"
      onAction={wait}
      confirmation={{
        title: "Revoke session?",
        description:
          "That browser will lose access immediately and must sign in again.",
        confirmLabel: "Revoke session",
      }}
    >
      Revoke session
    </A.AsyncActionButton>
    <A.AsyncActionButton variant="secondary" onAction={wait} isDisabled>
      Resend invitation
    </A.AsyncActionButton>
  </div>,
);
