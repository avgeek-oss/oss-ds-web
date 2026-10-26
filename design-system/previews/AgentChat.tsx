// @dsCard group="Assistant" height=672
import * as A from "../namespace.js";
import { mount } from "./mount.js";

type Item = A.AgentChatItem;

const items: Item[] = [
  {
    type: "user_text",
    id: "u1",
    text: "The billing worker looks stuck. Restart it.",
  },
  {
    type: "tool_call",
    id: "t1",
    name: "list_services",
    input: { name: "billing-worker" },
    origin: "server",
    status: "succeeded",
  },
  {
    type: "assistant_text",
    id: "a1",
    text: "`billing-worker` has not processed a job for 42 minutes. I can restart it.",
  },
  {
    type: "tool_call",
    id: "t2",
    name: "restart_service",
    input: { service: "billing-worker", environment: "production" },
    origin: "server",
    status: "pending",
  },
];

const describeTool: NonNullable<A.AgentChatProps["describeTool"]> = ({
  name,
}) => {
  if (name === "list_services") return { label: "Read services" };
  if (name === "restart_service")
    return {
      label: "Restart billing-worker",
      detail:
        "Active connections drop while the service restarts. It usually takes under a minute.",
    };
  return undefined;
};

mount(
  <div style={{ padding: 16 }}>
    <div
      style={{
        height: 640,
        maxWidth: 448,
        margin: "0 auto",
        overflow: "hidden",
        borderRadius: 16,
        border: "1px solid var(--separator)",
      }}
    >
      <A.AgentChat
        productName="Avgeek"
        items={items}
        pending={[
          {
            toolUseId: "t2",
            name: "restart_service",
            input: { service: "billing-worker", environment: "production" },
            kind: "confirmation",
          },
        ]}
        status="awaiting_confirmation"
        onSend={() => undefined}
        onDecide={() => undefined}
        onNewConversation={() => undefined}
        onClose={() => undefined}
        describeTool={describeTool}
      />
    </div>
  </div>,
);
