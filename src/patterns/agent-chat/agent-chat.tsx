"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  Alert02Icon,
  ArrowLeft01Icon,
  ArrowUp02Icon,
  Cancel01Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Cursor01Icon,
  Delete02Icon,
  PencilEdit02Icon,
  SparklesIcon,
  StopIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "../../buttons/button.js";
import { Alert } from "../../feedback/alert.js";
import { Spinner } from "../../feedback/spinner.js";
import { Textarea } from "../../forms/textarea.js";
import { cn } from "../../lib/utils.js";
import { AsyncActionButton } from "../actions/async-action-button.js";
import { AgentMarkdown } from "./agent-markdown.js";

/**
 * One entry of the conversation. Matches the transcript items that
 * `@avgeek-oss/agent-react` keeps in `useAgentChat().state.items`.
 */
export type AgentChatItem =
  | { type: "user_text"; id: string; text: string }
  | { type: "assistant_text"; id: string; text: string }
  | {
      type: "tool_call";
      id: string;
      name: string;
      input: unknown;
      origin: "server" | "client";
      status: "pending" | "succeeded" | "failed" | "declined";
      summary?: string;
    };

/** A tool call waiting on the user or the page. */
export interface AgentChatPendingCall {
  toolUseId: string;
  name: string;
  input: unknown;
  kind: "client_tool" | "confirmation";
}

export type AgentChatStatus =
  | "idle"
  | "loading"
  | "streaming"
  | "awaiting_confirmation"
  | "running_client_tools"
  | "error";

/** How a tool appears in the conversation. Apps name their own tools. */
export interface AgentToolPresentation {
  /** Short action, for example "Read today's records". */
  label: string;
  /** Extra context for approval, for example the record being changed. */
  detail?: string;
}

export interface AgentConversationSummary {
  id: string;
  title: string;
  /** Display time supplied by the app, for example "2h ago". */
  time: string;
  dateTime?: string;
}

export interface AgentChatProps {
  /** Product name, used in the empty state. */
  productName: string;
  /** Panel heading. Defaults to "Assistant". */
  title?: string;
  items: readonly AgentChatItem[];
  pending: readonly AgentChatPendingCall[];
  status: AgentChatStatus;
  error?: { message: string; retryable: boolean } | null;
  /** Reasoning summary for the running step, when the app streams one. */
  thinking?: string;
  onSend: (text: string) => void;
  /** Approves or declines a pending confirmation. */
  onDecide: (toolUseId: string, approved: boolean) => void;
  onStop?: () => void;
  /** Shown with retryable errors. */
  onRetry?: () => void;
  onNewConversation?: () => void;
  onClose?: () => void;
  describeTool?: (call: {
    name: string;
    input: unknown;
  }) => AgentToolPresentation | undefined;
  /** Starting prompts shown in an empty conversation. */
  suggestions?: readonly string[];
  emptyDescription?: ReactNode;
  placeholder?: string;
  /** Supplying conversations adds the history view. */
  conversations?: readonly AgentConversationSummary[];
  activeConversationId?: string | null;
  onSelectConversation?: (id: string) => void;
  /** Rejects on failure; the list reports it with a toast. */
  onDeleteConversation?: (id: string) => Promise<void>;
}

const icon = (value: typeof SparklesIcon, className = "size-4") => (
  <HugeiconsIcon aria-hidden="true" className={className} icon={value} />
);

/**
 * Fallback label for tools and input fields: `health_list_records` reads
 * "Health list records" and `publishAt` reads "Publish at".
 */
export function humanizeToolName(name: string): string {
  const words = name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase();
  return words ? words[0]!.toUpperCase() + words.slice(1) : name;
}

/**
 * The agent conversation surface: transcript, approvals for actions that
 * change data, and the composer. Fills its container; place it in
 * `AppLayout`'s `aside`. Apps supply state and callbacks from
 * `useAgentChat`.
 */
export function AgentChat({
  productName,
  title = "Assistant",
  items,
  pending,
  status,
  error,
  thinking,
  onSend,
  onDecide,
  onStop,
  onRetry,
  onNewConversation,
  onClose,
  describeTool,
  suggestions,
  emptyDescription,
  placeholder,
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
}: AgentChatProps) {
  const [view, setView] = useState<"chat" | "history">("chat");
  const present = (name: string, input: unknown) =>
    describeTool?.({ name, input }) ?? { label: humanizeToolName(name) };
  const busy =
    status === "streaming" ||
    status === "loading" ||
    status === "running_client_tools";

  return (
    <section
      aria-label={title}
      className="flex h-full min-h-0 flex-col bg-background text-foreground"
      data-slot="agent-chat"
    >
      <header className="flex min-h-16 shrink-0 items-center gap-1 border-b border-separator ps-4 pe-2">
        {view === "history" ? (
          <Button
            aria-label="Back to conversation"
            isIconOnly
            variant="ghost"
            onPress={() => setView("chat")}
          >
            {icon(ArrowLeft01Icon)}
          </Button>
        ) : null}
        <h2 className="min-w-0 flex-1 truncate text-sm font-medium">
          {view === "history" ? "History" : title}
        </h2>
        {conversations && view === "chat" ? (
          <Button
            aria-label="Conversation history"
            isIconOnly
            variant="ghost"
            onPress={() => setView("history")}
          >
            {icon(Clock01Icon)}
          </Button>
        ) : null}
        {onNewConversation ? (
          <Button
            aria-label="New conversation"
            isDisabled={busy}
            isIconOnly
            variant="ghost"
            onPress={() => {
              setView("chat");
              onNewConversation();
            }}
          >
            {icon(PencilEdit02Icon)}
          </Button>
        ) : null}
        {onClose ? (
          <Button
            aria-label={`Close ${title.toLowerCase()}`}
            isIconOnly
            variant="ghost"
            onPress={onClose}
          >
            {icon(Cancel01Icon)}
          </Button>
        ) : null}
      </header>
      {view === "history" && conversations ? (
        <ConversationHistory
          conversations={conversations}
          activeId={activeConversationId ?? null}
          onSelect={(id) => {
            setView("chat");
            onSelectConversation?.(id);
          }}
          onDelete={onDeleteConversation}
        />
      ) : (
        <>
          <Transcript
            productName={productName}
            items={items}
            pending={pending}
            status={status}
            error={error ?? null}
            thinking={thinking}
            present={present}
            onDecide={onDecide}
            onRetry={onRetry}
            onSend={onSend}
            suggestions={suggestions}
            emptyDescription={emptyDescription}
          />
          <Composer
            busy={busy}
            canStop={status === "streaming" && Boolean(onStop)}
            onStop={onStop}
            onSend={onSend}
            placeholder={placeholder ?? `Ask ${productName}…`}
          />
        </>
      )}
    </section>
  );
}

function Transcript({
  productName,
  items,
  pending,
  status,
  error,
  thinking,
  present,
  onDecide,
  onRetry,
  onSend,
  suggestions,
  emptyDescription,
}: {
  productName: string;
  items: readonly AgentChatItem[];
  pending: readonly AgentChatPendingCall[];
  status: AgentChatStatus;
  error: AgentChatProps["error"];
  thinking?: string;
  present: (name: string, input: unknown) => AgentToolPresentation;
  onDecide: AgentChatProps["onDecide"];
  onRetry?: () => void;
  onSend: (text: string) => void;
  suggestions?: readonly string[];
  emptyDescription?: ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const [decisions, setDecisions] = useState<Record<string, boolean>>({});
  const confirmations = new Map(
    pending
      .filter((call) => call.kind === "confirmation")
      .map((call) => [call.toolUseId, call]),
  );
  const lastItem = items.at(-1);
  const working = status === "streaming" && lastItem?.type !== "assistant_text";
  // A running tool row already shows progress; only its reasoning note is added.
  const toolRunning =
    lastItem?.type === "tool_call" && lastItem.status === "pending";

  useEffect(() => {
    // A new round of approvals starts without earlier local decisions.
    // oxlint-disable-next-line react/set-state-in-effect -- a new round of approvals starts without earlier local decisions
    if (pending.length === 0) setDecisions({});
  }, [pending.length]);

  useLayoutEffect(() => {
    const element = scroller.current;
    if (element && pinned.current) element.scrollTop = element.scrollHeight;
  });

  if (status === "loading")
    return (
      <div
        role="status"
        className="grid flex-1 place-items-center text-sm text-muted"
      >
        <span className="inline-flex items-center gap-2">
          <Spinner size="sm" color="current" aria-hidden="true" />
          Loading conversation…
        </span>
      </div>
    );

  return (
    <div
      ref={scroller}
      onScroll={(event) => {
        const element = event.currentTarget;
        pinned.current =
          element.scrollHeight - element.scrollTop - element.clientHeight < 48;
      }}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
    >
      {items.length === 0 && status !== "streaming" ? (
        <EmptyState
          productName={productName}
          description={emptyDescription}
          suggestions={suggestions}
          onSend={onSend}
        />
      ) : (
        <ol
          role="log"
          aria-label="Conversation"
          aria-live="polite"
          aria-busy={status === "streaming"}
          className="grid gap-5 px-4 py-5"
        >
          {items.map((item) => {
            if (item.type === "user_text")
              return (
                <li key={item.id} className="flex justify-end">
                  <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-ee-md bg-surface-secondary px-3.5 py-2 text-sm leading-6">
                    {item.text}
                  </p>
                </li>
              );
            if (item.type === "assistant_text")
              return (
                <li key={item.id}>
                  <AgentMarkdown text={item.text} />
                </li>
              );
            const confirmation = confirmations.get(item.id);
            const presentation = present(item.name, item.input);
            if (confirmation && item.status === "pending")
              return (
                <li key={item.id}>
                  <ConfirmationCard
                    presentation={presentation}
                    input={item.input}
                    decision={decisions[item.id]}
                    onDecide={(approved) => {
                      setDecisions((current) => ({
                        ...current,
                        [item.id]: approved,
                      }));
                      onDecide(item.id, approved);
                    }}
                  />
                </li>
              );
            return (
              <li key={item.id}>
                <ToolActivity item={item} presentation={presentation} />
              </li>
            );
          })}
          {working || status === "running_client_tools" ? (
            <li className="grid gap-1.5 text-sm leading-6 text-muted">
              {toolRunning && status === "streaming" ? null : (
                <span role="status" className="inline-flex items-center gap-2">
                  <Spinner size="sm" color="current" aria-hidden="true" />
                  {status === "running_client_tools"
                    ? "Updating the page…"
                    : "Working…"}
                </span>
              )}
              {thinking ? (
                <span className="line-clamp-3 ps-6">{thinking}</span>
              ) : null}
            </li>
          ) : null}
        </ol>
      )}
      {error && status === "error" ? (
        <div className="px-4 pb-5">
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>The assistant stopped</Alert.Title>
              <Alert.Description>{error.message}</Alert.Description>
              {error.retryable && onRetry ? (
                <Button
                  className="mt-2 w-fit"
                  size="sm"
                  variant="secondary"
                  onPress={onRetry}
                >
                  Try again
                </Button>
              ) : null}
            </Alert.Content>
          </Alert>
        </div>
      ) : null}
    </div>
  );
}

function EmptyState({
  productName,
  description,
  suggestions,
  onSend,
}: {
  productName: string;
  description?: ReactNode;
  suggestions?: readonly string[];
  onSend: (text: string) => void;
}) {
  return (
    <div className="grid min-h-full content-center justify-items-center gap-3 px-6 py-10 text-center">
      <span className="grid size-10 place-items-center rounded-full bg-accent/10 text-accent">
        {icon(SparklesIcon, "size-5")}
      </span>
      <h3 className="text-base font-medium">Ask {productName}</h3>
      <p className="max-w-xs text-sm text-muted">
        {description ??
          `Ask about your ${productName} data or describe a change. Actions that change data wait for your approval.`}
      </p>
      {suggestions?.length ? (
        <ul className="mt-2 grid w-full max-w-sm gap-2">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <Button
                className="h-auto min-h-10 w-full justify-start whitespace-normal py-2 text-start"
                variant="secondary"
                onPress={() => onSend(suggestion)}
              >
                {suggestion}
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

const statusText: Record<
  Extract<AgentChatItem, { type: "tool_call" }>["status"],
  string
> = {
  pending: "Running",
  succeeded: "Done",
  failed: "Failed",
  declined: "Declined",
};

function ToolActivity({
  item,
  presentation,
}: {
  item: Extract<AgentChatItem, { type: "tool_call" }>;
  presentation: AgentToolPresentation;
}) {
  const statusIcon =
    item.status === "pending" ? (
      <Spinner
        size="sm"
        color="current"
        aria-hidden="true"
        className="size-4"
      />
    ) : item.status === "succeeded" ? (
      icon(CheckmarkCircle02Icon, "size-4 text-success")
    ) : item.status === "declined" ? (
      icon(CancelCircleIcon, "size-4")
    ) : (
      icon(Alert02Icon, "size-4 text-danger")
    );
  // Same size and line height as paragraphs, so a tool line reads as part
  // of the conversation rather than as a caption.
  return (
    <div className="grid min-w-0 gap-1 py-1 text-sm leading-6 text-muted">
      <span className="flex min-w-0 flex-wrap items-center gap-x-2">
        <span className="inline-flex size-4 shrink-0 items-center justify-center">
          {statusIcon}
        </span>
        <span className="font-medium text-foreground">
          {presentation.label}
        </span>
        {item.origin === "client" ? (
          <span className="inline-flex items-center gap-1">
            {icon(Cursor01Icon, "size-3")}
            in this page
          </span>
        ) : null}
        <span className="sr-only">, </span>
        <span className={cn(item.status === "failed" && "text-danger")}>
          {statusText[item.status]}
        </span>
      </span>
      {item.summary && item.status !== "succeeded" ? (
        <span className="line-clamp-2 break-words ps-6">{item.summary}</span>
      ) : null}
    </div>
  );
}

function ConfirmationCard({
  presentation,
  input,
  decision,
  onDecide,
}: {
  presentation: AgentToolPresentation;
  input: unknown;
  decision: boolean | undefined;
  onDecide: (approved: boolean) => void;
}) {
  const fields = inputFields(input);
  return (
    <div
      role="group"
      aria-label={`Approve: ${presentation.label}`}
      className="grid gap-3 rounded-2xl border border-separator bg-surface p-3.5"
    >
      <div className="flex gap-2.5">
        <span className="mt-0.5 text-warning">{icon(Alert02Icon)}</span>
        <div className="grid min-w-0 gap-0.5">
          <p className="text-sm font-medium">{presentation.label}</p>
          <p className="text-sm leading-6 text-muted">
            {presentation.detail ??
              "This changes your data. The assistant waits for your decision."}
          </p>
        </div>
      </div>
      {fields.length ? (
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 rounded-xl bg-surface-secondary px-3 py-2 text-sm">
          {fields.map(([key, value]) => (
            <div key={key} className="contents">
              <dt className="text-muted">{key}</dt>
              <dd className="break-words font-mono">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {decision === undefined ? (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onPress={() => onDecide(false)}>
            Decline
          </Button>
          <Button size="sm" onPress={() => onDecide(true)}>
            Approve
          </Button>
        </div>
      ) : (
        <p role="status" className="text-end text-sm text-muted">
          {decision ? "Approved" : "Declined"}
        </p>
      )}
    </div>
  );
}

/** Top-level input fields as display strings, at most eight. */
function inputFields(input: unknown): [string, string][] {
  if (input === null || typeof input !== "object" || Array.isArray(input))
    return [];
  return Object.entries(input)
    .slice(0, 8)
    .map(([key, value]) => {
      const text = typeof value === "string" ? value : JSON.stringify(value);
      return [
        humanizeToolName(key),
        text.length > 160 ? `${text.slice(0, 159)}…` : text,
      ];
    });
}

function Composer({
  busy,
  canStop,
  onStop,
  onSend,
  placeholder,
}: {
  busy: boolean;
  canStop: boolean;
  onStop?: () => void;
  onSend: (text: string) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  const field = useRef<HTMLTextAreaElement>(null);
  const canSend = draft.trim().length > 0 && !busy;

  useLayoutEffect(() => {
    const element = field.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [draft]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (!canSend) return;
    onSend(draft.trim());
    setDraft("");
  };

  return (
    <form
      onSubmit={submit}
      className="shrink-0 border-t border-separator px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-end gap-2">
        <Textarea
          ref={field}
          aria-label="Message"
          className="max-h-40 flex-1 resize-none py-2.5"
          placeholder={placeholder}
          rows={1}
          value={draft}
          variant="secondary"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              submit();
            }
          }}
        />
        {canStop ? (
          <Button
            aria-label="Stop"
            className="shrink-0"
            isIconOnly
            size="lg"
            onPress={onStop}
          >
            {icon(StopIcon)}
          </Button>
        ) : (
          <Button
            aria-label="Send"
            className="shrink-0"
            isDisabled={!canSend}
            isIconOnly
            size="lg"
            type="submit"
          >
            {icon(ArrowUp02Icon)}
          </Button>
        )}
      </div>
    </form>
  );
}

function ConversationHistory({
  conversations,
  activeId,
  onSelect,
  onDelete,
}: {
  conversations: readonly AgentConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => Promise<void>;
}) {
  if (conversations.length === 0)
    return (
      <p className="px-4 py-10 text-center text-sm text-muted">
        No earlier conversations
      </p>
    );
  return (
    <ul className="min-h-0 flex-1 divide-y divide-separator overflow-y-auto">
      {conversations.map((conversation) => (
        <li key={conversation.id} className="flex items-center gap-1 pe-2">
          <button
            type="button"
            aria-current={conversation.id === activeId ? "true" : undefined}
            onClick={() => onSelect(conversation.id)}
            className="grid min-w-0 flex-1 gap-0.5 px-4 py-3 text-start outline-none transition-colors hover:bg-default/60 focus-visible:bg-default/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus aria-[current=true]:bg-default/60"
          >
            <span className="truncate text-sm">{conversation.title}</span>
            <time
              className="text-xs text-muted"
              dateTime={conversation.dateTime}
            >
              {conversation.time}
            </time>
          </button>
          {onDelete ? (
            <AsyncActionButton
              aria-label={`Delete ${conversation.title}`}
              isIconOnly
              size="sm"
              variant="ghost"
              onAction={() => onDelete(conversation.id)}
              confirmation={{
                title: "Delete conversation?",
                description:
                  "The conversation is removed for good. Data the assistant changed stays as it is.",
                confirmLabel: "Delete",
                variant: "danger",
              }}
            >
              {icon(Delete02Icon)}
            </AsyncActionButton>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
