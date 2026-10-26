// @dsCard group="Auth" height=520 width=720
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
const codes = Array.from(
  { length: 8 },
  (_, i) => `demo-${String(i + 1).padStart(4, "0")}-preview`,
);
mount(
  <A.RecoveryCodesScreen brand={brand} codes={codes} onContinue={() => {}} />,
);
