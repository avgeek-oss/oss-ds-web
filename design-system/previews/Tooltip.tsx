// @dsCard group="Overlays" height=112
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div
    style={{
      padding: "56px 16px 16px",
      display: "flex",
      gap: 24,
      alignItems: "center",
    }}
  >
    <A.Tooltip defaultOpen delay={0}>
      <A.Tooltip.Trigger<"button">
        className="button button--secondary inline-flex"
        render={(props) => <button {...props} />}
      >
        Copy key
      </A.Tooltip.Trigger>
      <A.Tooltip.Content placement="top">
        <A.Tooltip.Arrow />
        Copy to clipboard
      </A.Tooltip.Content>
    </A.Tooltip>
    <A.TooltipText
      style={{ maxWidth: 160, fontSize: 14 }}
      className="truncate"
      tooltip="A service with a long name · production"
    >
      A service with a long name · production
    </A.TooltipText>
  </div>,
);
