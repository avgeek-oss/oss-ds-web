// @dsCard group="Overlays" height=176
import * as React from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
function Example() {
  React.useEffect(() => {
    A.toast.danger("Could not save preferences. Try again.", { timeout: 0 });
  }, []);
  return (
    <div style={{ padding: 16, display: "flex", gap: 12 }}>
      <A.Button
        variant="secondary"
        onPress={() => A.toast.danger("Unable to continue. Try again.")}
      >
        Show error
      </A.Button>
      <A.Button
        variant="secondary"
        onPress={() => A.toast.info("Verification code requested.")}
      >
        Show info
      </A.Button>
      <A.Toast.Provider placement="bottom" />
    </div>
  );
}
mount(<Example />);
