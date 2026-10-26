// @dsCard group="Auth" height=368 width=720
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
  <A.ForgotPassword
    brand={brand}
    onSubmit={async () => {}}
    onBackToSignIn={() => {}}
  />,
);
