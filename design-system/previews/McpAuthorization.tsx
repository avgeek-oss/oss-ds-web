// @dsCard group="Auth" height=576 width=720
import * as React from "react";
import type { ComponentProps } from "react";
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
function Consent() {
  const [accessLevel, setAccessLevel] =
    React.useState<ComponentProps<typeof A.McpAuthorization>["accessLevel"]>(
      "read",
    );
  return (
    <A.McpAuthorization
      brand={brand}
      productName="Towbar"
      clientName="Example MCP client"
      clientLogo={
        <span aria-hidden="true" style={{ fontWeight: 500 }}>
          C
        </span>
      }
      accessLevel={accessLevel}
      availableAccessLevels={["read", "write", "admin"]}
      onAccessLevelChange={setAccessLevel}
      onApprove={() => {}}
      onDeny={() => {}}
    />
  );
}
mount(<Consent />);
