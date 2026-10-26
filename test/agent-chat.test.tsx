import "./dom-environment.js";
import assert from "node:assert/strict";
import test from "node:test";
import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AgentChat,
  humanizeToolName,
  type AgentChatItem,
  type AgentChatProps,
} from "../src/patterns/agent-chat/agent-chat.js";
import { AgentMarkdown } from "../src/patterns/agent-chat/agent-markdown.js";

async function mount(content: ReactNode) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => root.render(content));
  return {
    container,
    async unmount() {
      await act(async () => root.unmount());
      container.remove();
    },
  };
}

function button(container: Element, label: string) {
  const found = [...container.querySelectorAll("button")].find(
    (item) =>
      item.textContent?.trim() === label ||
      item.getAttribute("aria-label") === label,
  );
  assert.ok(found, `Missing button: ${label}`);
  return found;
}

async function click(element: Element) {
  await act(async () => {
    element.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
  });
}

async function type(field: HTMLTextAreaElement, value: string) {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value",
    )?.set;
    assert.ok(setter);
    setter.call(field, value);
    field.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

async function press(field: Element, key: string, shiftKey = false) {
  await act(async () => {
    field.dispatchEvent(
      new KeyboardEvent("keydown", {
        key,
        shiftKey,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
}

const baseProps: AgentChatProps = {
  productName: "Notes",
  items: [],
  pending: [],
  status: "idle",
  onSend: () => undefined,
  onDecide: () => undefined,
};

test("assistant Markdown renders structure without interpreting HTML or unsafe links", () => {
  const html = renderToStaticMarkup(
    <AgentMarkdown
      text={[
        "## Summary",
        "Use **bold**, `code` and [docs](https://example.test/docs).",
        "[bad](javascript:alert(1)) <script>alert(1)</script>",
        "",
        "- one",
        "- two",
        "",
        "> quoted draft",
        "",
        "| A | B |",
        "| --- | --- |",
        "| 1 | 2 |",
        "",
        "```",
        "<b>raw</b>",
        "```",
      ].join("\n")}
    />,
  );
  assert.match(html, /<strong[^>]*>bold<\/strong>/);
  assert.match(
    html,
    /<a href="https:\/\/example\.test\/docs" target="_blank" rel="noopener noreferrer"/,
  );
  assert.doesNotMatch(html, /href="javascript:/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /<ul[^>]*><li[^>]*>one<\/li><li[^>]*>two<\/li><\/ul>/);
  assert.match(html, /<blockquote[^>]*>quoted draft<\/blockquote>/);
  assert.match(html, /<th scope="col"[^>]*>A<\/th>/);
  assert.match(html, /<code>&lt;b&gt;raw&lt;\/b&gt;<\/code>/);
});

test("tool and field names fall back to readable labels", () => {
  assert.equal(humanizeToolName("health_list_records"), "Health list records");
  assert.equal(humanizeToolName("publishAt"), "Publish at");
  assert.equal(humanizeToolName("rootset-get-row"), "Rootset get row");
});

test("Enter sends the trimmed draft and clears it; Shift+Enter keeps typing", async () => {
  const sent: string[] = [];
  const view = await mount(
    <AgentChat {...baseProps} onSend={(text) => sent.push(text)} />,
  );
  const field = view.container.querySelector("textarea");
  assert.ok(field);
  await type(field, "  Which notes are due?  ");
  await press(field, "Enter", true);
  assert.deepEqual(sent, []);
  await press(field, "Enter");
  assert.deepEqual(sent, ["Which notes are due?"]);
  assert.equal(field.value, "");
  await view.unmount();
});

test("the composer offers Stop instead of Send while a reply streams", async () => {
  let stopped = 0;
  const sent: string[] = [];
  const view = await mount(
    <AgentChat
      {...baseProps}
      status="streaming"
      items={[{ type: "user_text", id: "u1", text: "Hi" }]}
      onSend={(text) => sent.push(text)}
      onStop={() => stopped++}
    />,
  );
  const field = view.container.querySelector("textarea");
  assert.ok(field);
  await type(field, "Another question");
  await press(field, "Enter");
  assert.deepEqual(sent, []);
  await click(button(view.container, "Stop"));
  assert.equal(stopped, 1);
  assert.match(view.container.textContent ?? "", /Working…/);
  await view.unmount();
});

test("a pending confirmation shows the app's label and input, and reports the decision once", async () => {
  const decisions: [string, boolean][] = [];
  const items: AgentChatItem[] = [
    {
      type: "tool_call",
      id: "t1",
      name: "delete_row",
      input: { rowId: 7 },
      origin: "server",
      status: "pending",
    },
  ];
  const view = await mount(
    <AgentChat
      {...baseProps}
      status="awaiting_confirmation"
      items={items}
      pending={[
        {
          toolUseId: "t1",
          name: "delete_row",
          input: { rowId: 7 },
          kind: "confirmation",
        },
      ]}
      describeTool={({ name }) =>
        name === "delete_row"
          ? { label: "Delete note 7", detail: "The note cannot be restored." }
          : undefined
      }
      onDecide={(id, approved) => decisions.push([id, approved])}
    />,
  );
  const card = view.container.querySelector('[role="group"]');
  assert.ok(card);
  assert.equal(card.getAttribute("aria-label"), "Approve: Delete note 7");
  assert.match(card.textContent ?? "", /The note cannot be restored\./);
  assert.match(card.textContent ?? "", /Row id7/);
  await click(button(view.container, "Approve"));
  assert.deepEqual(decisions, [["t1", true]]);
  assert.match(card.textContent ?? "", /Approved/);
  assert.equal(
    [...card.querySelectorAll("button")].length,
    0,
    "decision buttons are removed after a decision",
  );
  await view.unmount();
});

test("finished tool calls show their outcome and client tools say where they ran", () => {
  const html = renderToStaticMarkup(
    <AgentChat
      {...baseProps}
      items={[
        {
          type: "tool_call",
          id: "t1",
          name: "open_page",
          input: {},
          origin: "client",
          status: "succeeded",
        },
        {
          type: "tool_call",
          id: "t2",
          name: "list_rows",
          input: {},
          origin: "server",
          status: "failed",
          summary: "Permission denied",
        },
      ]}
    />,
  );
  assert.match(html, /Open page/);
  assert.match(html, /in this page/);
  assert.match(html, /Failed/);
  assert.match(html, /Permission denied/);
});

test("starting prompts send their text", async () => {
  const sent: string[] = [];
  const view = await mount(
    <AgentChat
      {...baseProps}
      suggestions={["Summarize today's notes"]}
      onSend={(text) => sent.push(text)}
    />,
  );
  await click(button(view.container, "Summarize today's notes"));
  assert.deepEqual(sent, ["Summarize today's notes"]);
  await view.unmount();
});
