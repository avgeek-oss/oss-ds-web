// @dsCard group="Data display" height=136
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const row = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 12,
} as const;
mount(
  <div style={{ display: "grid", gap: 16, padding: 16 }}>
    <div style={row}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <A.Avatar key={size} size={size} aria-label="Amelia Earhart">
          <A.Avatar.Fallback>AE</A.Avatar.Fallback>
        </A.Avatar>
      ))}
      <A.Avatar color="accent" variant="soft" aria-label="Charles Lindbergh">
        <A.Avatar.Fallback>CL</A.Avatar.Fallback>
      </A.Avatar>
    </div>
    <div style={row}>
      {(["default", "accent", "success", "warning", "danger"] as const).map(
        (color) => (
          <A.Avatar key={color} color={color} aria-label={`${color} avatar`}>
            <A.Avatar.Fallback>OP</A.Avatar.Fallback>
          </A.Avatar>
        ),
      )}
    </div>
  </div>,
);
