"use client";

import {
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DisclosureGroupStateContext } from "react-aria-components";
import { RouteLink as Link } from "../../navigation/route-link.js";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  ArrowRight02Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  StopCircleIcon,
} from "@hugeicons/core-free-icons";
import { Accordion } from "../../data-display/accordion.js";
import { Spinner } from "../../feedback/spinner.js";
import { cn } from "../../lib/utils.js";

export type ProgressChecklistItemProps = {
  id: string;
  title: string;
  description: ReactNode;
  status:
    "failed" | "running" | "skipped" | "succeeded" | "waiting" | "cancelled";
  runningTone?: "accent" | "warning";
  href?: string;
  /**
   * Whether the details start expanded. Defaults to expanding a failed item,
   * including one that fails after it rendered, until the user toggles it.
   */
  defaultExpanded?: boolean;
  children?: ReactNode;
};

export function ProgressChecklistItem({
  id,
  title,
  description,
  status,
  runningTone = "accent",
  href,
  defaultExpanded,
  children,
}: ProgressChecklistItemProps) {
  const canExpand = status !== "waiting" && children != null;
  const failed = status === "failed";
  const group = useContext(DisclosureGroupStateContext);
  const [userExpanded, setUserExpanded] = useState<boolean>();
  const automatic = canExpand && (defaultExpanded ?? failed);
  const expanded = canExpand && (userExpanded ?? automatic);
  const previousAutomatic = useRef<boolean>(undefined);
  // Inside an Accordion the group owns expansion and ignores an item's own
  // isExpanded, so automatic changes are applied to the group's keys. The
  // first pass only adds, which keeps keys an app expanded on purpose.
  useLayoutEffect(() => {
    const previous = previousAutomatic.current;
    previousAutomatic.current = automatic;
    if (!group || userExpanded !== undefined || previous === automatic) return;
    if (previous === undefined && !automatic) return;
    if (group.expandedKeys.has(id) === automatic) return;
    const keys = new Set(
      group.allowsMultipleExpanded ? group.expandedKeys : [],
    );
    if (automatic) keys.add(id);
    else keys.delete(id);
    group.setExpandedKeys(keys);
  }, [automatic, group, id, userExpanded]);
  const completed = status === "succeeded";
  const running = status === "running";
  const cancelled = status === "cancelled";
  const triggerClassName = cn(
    "flex items-start gap-3 rounded-xl p-2 text-left transition-colors disabled:cursor-default disabled:opacity-100 disabled:hover:bg-transparent",
    (canExpand || href) &&
      "hover:bg-default/80 data-[hovered=true]:bg-default/80",
  );
  const content = (
    <>
      <span className="sr-only">{status}</span>
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
          completed
            ? "bg-success-soft text-success-soft-foreground"
            : failed
              ? "bg-danger-soft text-danger-soft-foreground"
              : running
                ? runningTone === "warning"
                  ? "bg-warning-soft text-warning-soft-foreground"
                  : "bg-accent-soft text-accent-soft-foreground"
                : "bg-default text-muted",
        )}
      >
        {running ? (
          <Spinner color="current" size="sm" />
        ) : (
          <HugeiconsIcon
            className="size-5"
            icon={
              completed
                ? CheckmarkCircle01Icon
                : failed
                  ? AlertCircleIcon
                  : cancelled
                    ? StopCircleIcon
                    : Clock01Icon
            }
          />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
        <span className="grid min-w-0 flex-1 basis-48">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <span className="text-sm leading-relaxed font-normal text-muted">
            {description}
          </span>
        </span>
      </span>
      {href ? (
        <HugeiconsIcon
          aria-hidden="true"
          icon={ArrowRight02Icon}
          className="size-4 shrink-0 self-center text-muted"
        />
      ) : canExpand ? (
        <Accordion.Indicator className="shrink-0 self-center text-muted" />
      ) : (
        <span aria-hidden="true" className="size-4 shrink-0 self-center" />
      )}
    </>
  );
  if (href)
    return (
      <Link
        href={href}
        className={cn(
          triggerClassName,
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        )}
      >
        {content}
      </Link>
    );
  return (
    <Accordion.Item
      id={id}
      isDisabled={!canExpand}
      isExpanded={expanded}
      onExpandedChange={setUserExpanded}
      className="overflow-hidden rounded-xl border border-separator transition-colors data-[expanded=true]:bg-default/40"
    >
      <Accordion.Heading>
        <Accordion.Trigger className={triggerClassName}>
          {content}
        </Accordion.Trigger>
      </Accordion.Heading>
      {canExpand ? (
        <Accordion.Panel>
          <Accordion.Body className="grid gap-3 p-2 sm:pl-14">
            {children}
          </Accordion.Body>
        </Accordion.Panel>
      ) : null}
    </Accordion.Item>
  );
}
