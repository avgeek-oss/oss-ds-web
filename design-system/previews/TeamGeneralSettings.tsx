// @dsCard group="Team settings" height=344
import * as React from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
function TeamDetails() {
  const [value, setValue] = React.useState({
    name: "Avgeek",
    description: "Fleet tooling and shared services for the Avgeek OSS apps.",
  });
  return (
    <div style={{ padding: 16, maxWidth: 512 }}>
      <A.TeamGeneralSettings
        mode="details"
        value={value}
        onSave={async (next) => setValue(next)}
      />
    </div>
  );
}
mount(<TeamDetails />);
