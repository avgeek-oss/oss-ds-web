// @dsCard group="Assistant" height=72
import * as A from "../namespace.js";
import { mount } from "./mount.js";

mount(
  <div style={{ display: "flex", gap: 16, alignItems: "center", padding: 16 }}>
    <A.AgentChatTrigger isOpen={false} onOpenChange={() => undefined} />
    <A.AgentChatTrigger isOpen onOpenChange={() => undefined} />
    <A.AgentChatTrigger
      isOpen={false}
      needsAttention
      onOpenChange={() => undefined}
    />
  </div>,
);
