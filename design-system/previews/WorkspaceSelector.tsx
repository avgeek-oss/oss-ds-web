// @dsCard group="Navigation" height=176 width=288
import * as React from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
function Example() {
  const [workspace, setWorkspace] = React.useState("default");
  return (
    <div className="sidebar-body grid">
      <A.WorkspaceSelector
        items={[
          { id: "default", name: "Default" },
          { id: "design", name: "Design" },
        ]}
        selectedKey={workspace}
        onSelectionChange={setWorkspace}
        onCreate={() => {}}
      />
    </div>
  );
}
mount(<Example />);
