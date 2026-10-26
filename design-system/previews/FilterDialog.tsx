// @dsCard group="Data patterns" height=400
import * as React from "react";
import type { ComponentProps } from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
function Filters() {
  const [value, setValue] = React.useState<
    ComponentProps<typeof A.FilterDialog>["value"]
  >([{ field: "status", operator: "in", value: ["404", "500"] }]);
  React.useEffect(() => {
    // Open the dialog through its own trigger so the card shows the editing state.
    const trigger = Array.from(document.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Filters"),
    );
    trigger?.click();
  }, []);
  return (
    <div style={{ padding: 16 }}>
      <A.FilterDialog
        value={value}
        onChange={setValue}
        fields={[
          {
            field: "status",
            label: "Response status",
            searchable: true,
            operators: [{ value: "in", label: "Is one of", multiple: true }],
          },
          {
            field: "path",
            label: "Path",
            placeholder: "/api/",
            operators: [{ value: "contains", label: "Contains" }],
          },
        ]}
        getOptions={async (_field: string, search: string) =>
          ["200", "400", "404", "500"].filter((v) => v.includes(search))
        }
      />
    </div>
  );
}
mount(<Filters />);
