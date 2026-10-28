import { useEffect, useRef, useState } from "react";
import type {
  AgentChatItem,
  AgentChatPendingCall,
  AgentChatProps,
  AgentChatStatus,
  AgentConversationSummary,
  AgentToolPresentation,
} from "../src/patterns/agent-chat/agent-chat";

/** Tool labels for the fixture's service catalog. */
export const describeServiceTool = ({
  name,
  input,
}: {
  name: string;
  input: unknown;
}): AgentToolPresentation | undefined => {
  const fields =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};
  switch (name) {
    case "list_services":
      return { label: "Read services" };
    case "list_deployments":
      return { label: "Read recent deployments" };
    case "restart_service":
      return {
        label: `Restart ${typeof fields.service === "string" ? fields.service : "service"}`,
        detail:
          "Active connections drop while the service restarts. It usually takes under a minute.",
      };
    case "open_page":
      return {
        label: `Open ${typeof fields.path === "string" ? fields.path : "page"}`,
      };
    default:
      return undefined;
  }
};

export const serviceSuggestions = [
  "Which services failed a health check today?",
  "Summarize this week's deployments",
  "Restart the billing worker",
];

export const completedConversation: AgentChatItem[] = [
  {
    type: "user_text",
    id: "u1",
    text: "Which services had failed deployments this week?",
  },
  {
    type: "tool_call",
    id: "t1",
    name: "list_deployments",
    input: { since: "2026-10-19", status: "failed" },
    origin: "server",
    status: "succeeded",
  },
  {
    type: "assistant_text",
    id: "a1",
    text: "Two services had failed deployments this week:\n\n| Service | Failed | Last error |\n| --- | --- | --- |\n| billing-worker | 2 | Health check timed out |\n| search-api | 1 | Image pull failed |\n\nBoth are running the previous release. **billing-worker** failed twice on the same health check, so it is worth a look before the next deploy.",
  },
];

export const approvalConversation: AgentChatItem[] = [
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

export const approvalPending: AgentChatPendingCall[] = [
  {
    toolUseId: "t2",
    name: "restart_service",
    input: { service: "billing-worker", environment: "production" },
    kind: "confirmation",
  },
];

export const sampleConversations: AgentConversationSummary[] = [
  {
    id: "c1",
    title: "Which services had failed deployments this week?",
    time: "Just now",
  },
  { id: "c2", title: "Restart the billing worker", time: "2h ago" },
  {
    id: "c3",
    title: "Compare search-api latency before and after the cache change",
    time: "Yesterday",
  },
];

type SimulatedState = Pick<
  AgentChatProps,
  "items" | "pending" | "status" | "error" | "thinking"
>;

/**
 * A scripted agent for fixtures. Messages mentioning "restart" ask for
 * approval; others read data and answer. Timers stand in for the server.
 */
export function useSimulatedAgent(initial: Partial<SimulatedState> = {}) {
  const [state, setState] = useState<SimulatedState>({
    items: initial.items ?? [],
    pending: initial.pending ?? [],
    status: initial.status ?? "idle",
    error: initial.error ?? null,
    thinking: initial.thinking,
  });
  const timers = useRef<number[]>([]);
  const ids = useRef(0);
  useEffect(() => {
    const scheduled = timers.current;
    return () => scheduled.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const later = (ms: number, run: () => void) => {
    timers.current.push(window.setTimeout(run, ms));
  };
  const nextId = () => `sim-${++ids.current}`;
  const update = (
    change: (current: SimulatedState) => Partial<SimulatedState>,
  ) => setState((current) => ({ ...current, ...change(current) }));
  const setStatus = (status: AgentChatStatus) => update(() => ({ status }));

  const stream = (text: string, done: () => void) => {
    const id = nextId();
    const words = text.split(/(?<= )/);
    words.forEach((_, index) =>
      later(40 * (index + 1), () =>
        update((current) => {
          const partial = words.slice(0, index + 1).join("");
          const exists = current.items.some((item) => item.id === id);
          return {
            items: exists
              ? current.items.map((item) =>
                  item.id === id ? { ...item, text: partial } : item,
                )
              : [
                  ...current.items,
                  { type: "assistant_text", id, text: partial },
                ],
          };
        }),
      ),
    );
    later(40 * (words.length + 1), done);
  };

  const runTool = (
    call: Extract<AgentChatItem, { type: "tool_call" }>,
    then: () => void,
  ) => {
    update((current) => ({ items: [...current.items, call] }));
    later(700, () => {
      update((current) => ({
        items: current.items.map((item) =>
          item.id === call.id && item.type === "tool_call"
            ? { ...item, status: "succeeded" }
            : item,
        ),
      }));
      then();
    });
  };

  const send = (text: string) => {
    update((current) => ({
      items: [...current.items, { type: "user_text", id: nextId(), text }],
      status: "streaming",
      error: null,
      thinking: "Checking which services match the question…",
    }));
    const restart = /restart/i.test(text);
    later(500, () =>
      runTool(
        {
          type: "tool_call",
          id: nextId(),
          name: "list_services",
          input: {},
          origin: "server",
          status: "pending",
        },
        () =>
          restart
            ? stream(
                "`billing-worker` has not processed a job for 42 minutes. I can restart it.",
                () => {
                  const id = nextId();
                  const input = {
                    service: "billing-worker",
                    environment: "production",
                  };
                  update((current) => ({
                    items: [
                      ...current.items,
                      {
                        type: "tool_call",
                        id,
                        name: "restart_service",
                        input,
                        origin: "server",
                        status: "pending",
                      },
                    ],
                    pending: [
                      {
                        toolUseId: id,
                        name: "restart_service",
                        input,
                        kind: "confirmation",
                      },
                    ],
                    status: "awaiting_confirmation",
                    thinking: undefined,
                  }));
                },
              )
            : stream(
                "All **12 services** passed their last health check. `search-api` is the slowest at 210 ms p95, up from 160 ms last week.",
                () => update(() => ({ status: "idle", thinking: undefined })),
              ),
      ),
    );
  };

  const decide = (toolUseId: string, approved: boolean) => {
    update((current) => ({
      pending: [],
      status: "streaming",
      items: current.items.map((item) =>
        item.id === toolUseId && item.type === "tool_call"
          ? {
              ...item,
              status: approved ? "succeeded" : "declined",
              summary: approved ? undefined : "Declined",
            }
          : item,
      ),
    }));
    later(400, () =>
      stream(
        approved
          ? "Restarted `billing-worker`. It picked up 18 queued jobs within a minute."
          : "Okay, I left `billing-worker` running as it is.",
        () => setStatus("idle"),
      ),
    );
  };

  const reset = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    setState({ items: [], pending: [], status: "idle", error: null });
  };

  const stop = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    update(() => ({ status: "idle", thinking: undefined }));
  };

  return { state, send, decide, reset, stop };
}
