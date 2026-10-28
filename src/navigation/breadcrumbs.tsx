"use client";

import type { JSX } from "react";

import { TooltipText } from "../overlays/tooltip.js";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ComponentProps,
  type MouseEvent,
} from "react";
import {
  composeRenderProps,
  OverlayTriggerStateContext,
} from "react-aria-components";
import { useFocusManager } from "react-aria";
import { useObjectRef } from "@react-aria/utils";
import { Dropdown } from "../overlays/dropdown.js";
import { Select } from "../forms/select.js";

import { cn } from "../lib/utils.js";
import type { AppShellBreadcrumbItems } from "../layouts/application-shell-types.js";
import { useAppNavigate } from "../hooks/app-navigation.js";

const BreadcrumbItemContext = createContext(false);

const triggerClassName =
  "flex h-auto! min-h-0! min-w-0 max-w-40 transform-none! items-center gap-1 rounded-sm! border-0! bg-transparent! px-0! py-0! text-sm shadow-none! outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 sm:max-w-64";

function BreadcrumbDropdownTrigger({
  children,
  className,
  ...props
}: ComponentProps<typeof Dropdown.Trigger>): JSX.Element {
  const isCurrent = useContext(BreadcrumbItemContext);
  return (
    <Dropdown.Trigger
      aria-current={isCurrent ? "page" : undefined}
      {...props}
      className={composeRenderProps(className, (className) =>
        cn(
          triggerClassName,
          isCurrent ? "font-medium text-foreground" : "font-normal text-muted",
          className,
        ),
      )}
    >
      {composeRenderProps(children, (children) => (
        <>
          <span className="min-w-0 truncate">{children}</span>
          <Select.Indicator className="static! size-3 shrink-0 text-muted" />
        </>
      ))}
    </Dropdown.Trigger>
  );
}

function BreadcrumbSelectTrigger({
  children,
  className,
  ...props
}: ComponentProps<typeof Select.Trigger>): JSX.Element {
  const isCurrent = useContext(BreadcrumbItemContext);
  return (
    <Select.Trigger
      aria-current={isCurrent ? "page" : undefined}
      {...props}
      className={composeRenderProps(className, (className) =>
        cn(
          triggerClassName,
          isCurrent ? "font-medium text-foreground" : "font-normal text-muted",
          className,
        ),
      )}
    >
      {composeRenderProps(children, (children) => (
        <>
          <span className="min-w-0 truncate">{children}</span>
          <Select.Indicator className="static! size-3 shrink-0 text-muted" />
        </>
      ))}
    </Select.Trigger>
  );
}

function ReopenedPopoverFocus({
  isOpen,
  popover,
}: {
  isOpen: boolean;
  popover: { current: HTMLElement | null };
}) {
  const focusManager = useFocusManager();
  const previousOpen = useRef(isOpen);
  useEffect(() => {
    const reopened = isOpen && !previousOpen.current;
    previousOpen.current = isOpen;
    if (!reopened) return;
    // A retained native FocusScope does not repeat its mount autofocus after an interrupted exit.
    const frame = requestAnimationFrame(() => {
      const node = popover.current;
      if (!node?.isConnected) return;
      const document = node.ownerDocument;
      const active = document.activeElement;
      const controls = active?.getAttribute("aria-controls")?.split(/\s+/);
      const linkedTrigger = controls?.some((id) =>
        node.contains(document.getElementById(id)),
      );
      if (document.hasFocus() && (active === document.body || linkedTrigger))
        focusManager?.focusFirst();
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, popover, focusManager]);
  return null;
}

function BreadcrumbDropdownPopover({
  className,
  ref,
  children,
  ...props
}: ComponentProps<typeof Dropdown.Popover>): JSX.Element {
  const state = useContext(OverlayTriggerStateContext);
  const popover = useObjectRef<HTMLElement>(ref);
  return (
    <Dropdown.Popover
      {...props}
      ref={popover}
      className={composeRenderProps(className, (className) =>
        cn("breadcrumb-popover", className),
      )}
    >
      <ReopenedPopoverFocus
        isOpen={props.isOpen ?? state?.isOpen ?? false}
        popover={popover}
      />
      {children}
    </Dropdown.Popover>
  );
}

function BreadcrumbSelectPopover({
  className,
  ref,
  children,
  ...props
}: ComponentProps<typeof Select.Popover>): JSX.Element {
  const state = useContext(OverlayTriggerStateContext);
  const popover = useObjectRef<HTMLElement>(ref);
  return (
    <Select.Popover
      {...props}
      ref={popover}
      className={composeRenderProps(className, (className) =>
        cn("breadcrumb-popover", className),
      )}
    >
      <ReopenedPopoverFocus
        isOpen={props.isOpen ?? state?.isOpen ?? false}
        popover={popover}
      />
      {children}
    </Select.Popover>
  );
}

export const BreadcrumbDropdown: Omit<
  typeof Dropdown,
  "Trigger" | "Popover"
> & {
  Trigger: typeof BreadcrumbDropdownTrigger;
  Popover: typeof BreadcrumbDropdownPopover;
} = {
  // oxlint-disable-next-line typescript/no-misused-spread -- copies the compound component's static subcomponents, then replaces Trigger and Popover
  ...Dropdown,
  Trigger: BreadcrumbDropdownTrigger,
  Popover: BreadcrumbDropdownPopover,
};
export const BreadcrumbSelect: Omit<typeof Select, "Trigger" | "Popover"> & {
  Trigger: typeof BreadcrumbSelectTrigger;
  Popover: typeof BreadcrumbSelectPopover;
} = {
  // oxlint-disable-next-line typescript/no-misused-spread -- copies the compound component's static subcomponents, then replaces Trigger and Popover
  ...Select,
  Trigger: BreadcrumbSelectTrigger,
  Popover: BreadcrumbSelectPopover,
};

export function BreadcrumbTrail({
  className,
  items,
}: {
  className?: string;
  items: AppShellBreadcrumbItems;
}) {
  const navigate = useAppNavigate();
  const visibleItems = items.filter(
    (item, index) =>
      !(index === 0 && item.href === "/") &&
      (index === items.length - 1 || Boolean(item.href || item.content)),
  );

  if (visibleItems.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("min-w-0 overflow-hidden", className)}
      data-slot="breadcrumb"
    >
      <ol className="flex min-w-0 items-center gap-2 overflow-hidden text-sm whitespace-nowrap">
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          return (
            <li
              className={cn(
                "flex min-w-0 items-center gap-2",
                isLast ? "flex-1" : "shrink",
              )}
              key={`${item.contentKey ?? item.href ?? (item.content ? "content" : item.label)}-${index}`}
            >
              {index > 0 ? (
                <span aria-hidden="true" className="text-muted">
                  /
                </span>
              ) : null}
              {item.content ? (
                <BreadcrumbItemContext.Provider value={isLast}>
                  {item.content}
                </BreadcrumbItemContext.Provider>
              ) : item.href && !isLast ? (
                <a
                  className="block min-w-0 max-w-40 truncate font-normal text-muted sm:max-w-64"
                  href={item.href}
                  onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                    if (
                      !navigate ||
                      event.button !== 0 ||
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey
                    )
                      return;
                    event.preventDefault();
                    navigate(item.href!);
                  }}
                >
                  <TooltipText tooltip={item.label} tabIndex={-1}>
                    {item.label}
                  </TooltipText>
                </a>
              ) : (
                <TooltipText
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "block min-w-0 truncate",
                    isLast
                      ? "font-medium text-foreground"
                      : "font-normal text-muted",
                  )}
                  tooltip={item.label}
                >
                  {item.label}
                </TooltipText>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
