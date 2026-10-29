// @dsCard group="Auth" height=760 width=720
import * as React from "react";
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
  const [ceiling, setCeiling] = React.useState<A.TeamRole>("viewer");
  return (
    <A.McpAuthorization
      brand={brand}
      productName="Towbar"
      client={{
        name: "Example MCP client",
        logo: (
          <span aria-hidden="true" style={{ fontWeight: 500 }}>
            C
          </span>
        ),
        redirectHost: "127.0.0.1:53682",
        localhost: true,
      }}
      resources={[
        { uri: "https://api.towbar.example/mcp", name: "Towbar MCP" },
      ]}
      ceiling={ceiling}
      ceilings={["viewer", "member"]}
      onCeilingChange={setCeiling}
      onApprove={() => {}}
      onDeny={() => {}}
    />
  );
}
mount(<Consent />);
