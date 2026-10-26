import { Fragment, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";

/**
 * Renders the Markdown subset assistants write in chat: paragraphs, headings,
 * lists, fenced code, tables, emphasis, inline code and http(s) links. Raw
 * HTML is never interpreted, and other link schemes stay plain text. Partial
 * syntax from a streaming reply renders literally until it is closed.
 */
export function AgentMarkdown({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 text-sm leading-6", className)}>
      {parseBlocks(text).map((block, index) => (
        <Fragment key={index}>{renderBlock(block)}</Fragment>
      ))}
    </div>
  );
}

type Block =
  | { type: "paragraph"; lines: string[] }
  | { type: "heading"; text: string }
  | { type: "quote"; lines: string[] }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "code"; code: string }
  | { type: "table"; header: string[]; rows: string[][] };

const listItem = /^\s*(?:[-*+]|(\d+)[.)])\s+(.*)$/;
const tableSeparator = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;

export function parseBlocks(text: string): Block[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (!line.trim()) {
      index++;
      continue;
    }
    if (line.trimStart().startsWith("```")) {
      const code: string[] = [];
      index++;
      while (
        index < lines.length &&
        !lines[index]?.trimStart().startsWith("```")
      )
        code.push(lines[index++] ?? "");
      index++;
      blocks.push({ type: "code", code: code.join("\n") });
      continue;
    }
    const heading = /^\s*#{1,6}\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({ type: "heading", text: heading[1] ?? "" });
      index++;
      continue;
    }
    if (line.includes("|") && tableSeparator.test(lines[index + 1] ?? "")) {
      const header = cells(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index]?.includes("|"))
        rows.push(cells(lines[index++] ?? ""));
      blocks.push({ type: "table", header, rows });
      continue;
    }
    if (/^\s*>/.test(line)) {
      const quoted: string[] = [];
      while (index < lines.length && /^\s*>/.test(lines[index] ?? ""))
        quoted.push((lines[index++] ?? "").replace(/^\s*>\s?/, ""));
      blocks.push({ type: "quote", lines: quoted });
      continue;
    }
    const firstItem = listItem.exec(line);
    if (firstItem) {
      const ordered = firstItem[1] !== undefined;
      const items: string[] = [];
      while (index < lines.length) {
        const match = listItem.exec(lines[index] ?? "");
        if (!match || (match[1] !== undefined) !== ordered) break;
        items.push(match[2] ?? "");
        index++;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }
    const paragraph: string[] = [];
    while (index < lines.length) {
      const next = lines[index] ?? "";
      if (
        !next.trim() ||
        next.trimStart().startsWith("```") ||
        /^\s*#{1,6}\s/.test(next) ||
        /^\s*>/.test(next) ||
        listItem.test(next)
      )
        break;
      paragraph.push(next);
      index++;
    }
    blocks.push({ type: "paragraph", lines: paragraph });
  }
  return blocks;
}

function cells(row: string): string[] {
  return row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderBlock(block: Block): ReactNode {
  switch (block.type) {
    case "heading":
      return <p className="font-medium">{inline(block.text)}</p>;
    case "quote":
      return (
        <blockquote className="border-s-2 border-separator ps-3 text-muted">
          {block.lines.map((line, index) => (
            <Fragment key={index}>
              {index > 0 ? <br /> : null}
              {inline(line)}
            </Fragment>
          ))}
        </blockquote>
      );
    case "paragraph":
      return (
        <p className="break-words">
          {block.lines.map((line, index) => (
            <Fragment key={index}>
              {index > 0 ? <br /> : null}
              {inline(line)}
            </Fragment>
          ))}
        </p>
      );
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List
          className={cn(
            "grid gap-1 ps-5",
            block.ordered ? "list-decimal" : "list-disc",
          )}
        >
          {block.items.map((item, index) => (
            <li key={index} className="break-words ps-0.5">
              {inline(item)}
            </li>
          ))}
        </List>
      );
    }
    case "code":
      return (
        <pre className="overflow-x-auto rounded-xl bg-surface-secondary px-3 py-2.5 font-mono text-xs leading-5">
          <code>{block.code}</code>
        </pre>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-xl border border-separator">
          <table className="w-full border-collapse text-start text-xs">
            <thead className="bg-surface-secondary">
              <tr>
                {block.header.map((cell, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="whitespace-nowrap px-3 py-2 text-start font-medium"
                  >
                    {inline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-separator">
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {block.header.map((_, cellIndex) => (
                    <td key={cellIndex} className="px-3 py-2 align-top">
                      {inline(row[cellIndex] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

const inlinePattern =
  /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\s][^*\n]*\*|_[^_\s][^_\n]*_)|(\[[^\]\n]+\]\([^)\s]+\))/g;

function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(inlinePattern)) {
    const [token] = match;
    const start = match.index;
    if (start > last) nodes.push(text.slice(last, start));
    const key = nodes.length;
    if (match[1])
      nodes.push(
        <code
          key={key}
          className="rounded-md bg-surface-secondary px-1 py-0.5 font-mono text-[0.8125rem]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    else if (match[2])
      nodes.push(
        <strong key={key} className="font-semibold">
          {inline(token.slice(2, -2))}
        </strong>,
      );
    else if (match[3])
      nodes.push(<em key={key}>{inline(token.slice(1, -1))}</em>);
    else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      const href = link?.[2] ?? "";
      nodes.push(
        /^https?:\/\//i.test(href) ? (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2"
          >
            {link?.[1]}
          </a>
        ) : (
          token
        ),
      );
    }
    last = start + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
