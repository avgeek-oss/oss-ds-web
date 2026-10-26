// @dsCard group="Account settings" height=304
import * as React from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
function Preferences() {
  const [value, setValue] = React.useState({
    dateFormat: "day-short-month-year",
    timeFormat: "24-hour",
    timeZone: "UTC",
  });
  return (
    <div style={{ padding: 16, maxWidth: 512 }}>
      <A.PreferencesSettings
        value={value}
        options={{
          dateFormats: A.dateFormatOptions,
          timeFormats: A.timeFormatOptions,
          timeZones: [
            "UTC",
            "Asia/Kolkata",
            "America/New_York",
            "Europe/London",
          ],
        }}
        onSave={async (preferences) => setValue(preferences)}
      />
    </div>
  );
}
mount(<Preferences />);
