// @dsCard group="Account settings" height=352
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ padding: 16 }}>
    <A.McpGuideSettings
      configurations={A.mcpClientConfigurations({
        serverName: "towbar",
        url: "https://towbar.example.test/mcp",
      })}
      documentationUrl="https://towbar.example.test/docs/mcp"
    />
  </div>,
);
