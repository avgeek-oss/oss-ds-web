// @dsCard group="Typography" height=208
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const code =
  '{\n  "mcpServers": {\n    "avgeek": { "url": "https://ops.avgeek.dev/mcp" }\n  }\n}';
mount(
  <div style={{ padding: 16, maxWidth: 640 }}>
    <A.CodeBlock>
      <A.CodeBlock.Header>
        <A.CodeBlock.Filename>mcp.json</A.CodeBlock.Filename>
        <A.CodeBlock.CopyButton code={code} />
      </A.CodeBlock.Header>
      <A.CodeBlock.Code language="json" code={code} />
    </A.CodeBlock>
  </div>,
);
