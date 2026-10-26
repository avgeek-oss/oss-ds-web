// @dsCard group="Account settings" height=352
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ padding: 16 }}>
    <A.McpGuideSettings
      configurations={[
        {
          id: "codex",
          label: "Codex",
          filename: "~/.codex/config.toml",
          code: '[mcp_servers.towbar]\nurl = "https://towbar.example.test/mcp"',
        },
        {
          id: "claude",
          label: "Claude Code",
          filename: "Command",
          code: "claude mcp add --transport http towbar https://towbar.example.test/mcp",
        },
      ]}
      documentationUrl="https://towbar.example.test/docs/mcp"
    />
  </div>,
);
