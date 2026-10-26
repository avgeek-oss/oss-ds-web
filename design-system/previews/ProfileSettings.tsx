// @dsCard group="Account settings" height=224
import * as React from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
function Profile() {
  const [name, setName] = React.useState("Alex Rivera");
  return (
    <div style={{ padding: 16, maxWidth: 512 }}>
      <A.ProfileSettings
        value={name}
        onSave={async (value: string) => setName(value)}
      />
    </div>
  );
}
mount(<Profile />);
