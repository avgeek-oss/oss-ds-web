// @dsCard group="Auth" height=328 width=720
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const brand = (
  <A.BrandLockup
    logo={
      <div
        aria-hidden="true"
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "var(--accent)",
        }}
      />
    }
  >
    Avgeek
  </A.BrandLockup>
);
mount(
  <A.AcceptInvitation
    brand={brand}
    teamName="Avgeek"
    role="Member"
    onVerifyEmail={() => {}}
    onBackToSignIn={() => {}}
  />,
);
