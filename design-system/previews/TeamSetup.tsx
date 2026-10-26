// @dsCard group="Auth" height=696 width=720
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
  <A.TeamSetup
    brand={brand}
    preferenceOptions={{
      dateFormats: A.dateFormatOptions,
      timeFormats: A.timeFormatOptions,
      timeZones: ["UTC", "Asia/Kolkata", "America/New_York", "Europe/London"],
    }}
    onSubmit={async () => {}}
  />,
);
