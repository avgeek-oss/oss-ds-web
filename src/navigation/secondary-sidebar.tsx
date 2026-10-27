"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { TooltipText } from "../overlays/tooltip.js";
import { createPortal } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon } from "@hugeicons/core-free-icons";
import { menuItemVariants } from "@heroui/styles";
import { cn } from "../lib/utils.js";
import { useMobileNavigation } from "../hooks/app-navigation.js";
import { RouteLink } from "./route-link.js";

export const DetailSettingsContext = createContext<boolean | null>(null);

const SecondaryContext = createContext<{
  host: HTMLElement | null;
  close: () => void;
}>({ host: null, close: () => {} });

export function SecondarySidebarLayout({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const mobileNavigation = useMobileNavigation();
  return (
    <SecondaryContext.Provider
      value={{
        host: mobileNavigation.isMobile ? mobileNavigation.host : host,
        close: mobileNavigation.close,
      }}
    >
      <div className="min-w-0 lg:grid lg:has-[[data-secondary-menu]]:grid-cols-[auto_minmax(0,1fr)]">
        <aside className="hidden min-w-0 border-r border-separator bg-background lg:has-[[data-secondary-menu]]:block lg:w-66 lg:sticky lg:top-[calc(4rem+var(--app-shell-top-offset,0px))] lg:h-[calc(100dvh-4rem-var(--app-shell-top-offset,0px))] lg:self-start">
          <div className="h-full overflow-y-auto overscroll-contain">
            <nav
              aria-label="Page navigation"
              className="sidebar-body grid content-start"
              ref={setHost}
            />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </SecondaryContext.Provider>
  );
}

export function SecondarySection({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const { host } = useContext(SecondaryContext);
  const { registerSecondaryNavigation } = useMobileNavigation();
  useEffect(registerSecondaryNavigation, [registerSecondaryNavigation]);
  const content = (
    <section data-secondary-menu className={cn("sidebar-section", className)}>
      {title ? <h2 className="sidebar-section-heading">{title}</h2> : null}
      {children}
    </section>
  );
  return host ? createPortal(content, host) : null;
}

export function SecondaryEntityHeader({
  children,
  title,
  icon,
}: {
  children: ReactNode;
  title: string;
  icon: ReactNode;
}) {
  const { host } = useContext(SecondaryContext);
  return host
    ? createPortal(
        <div
          data-secondary-menu
          data-secondary-header
          className="sidebar-entity-header order-[-2] flex min-w-0 items-center gap-2 px-2 text-sm font-medium text-foreground lg:text-lg lg:leading-7"
        >
          <span aria-hidden="true" className="sidebar-heading-icon">
            {icon}
          </span>
          {typeof children === "string" ? (
            <TooltipText className="min-w-0 flex-1 truncate" tooltip={title}>
              {children}
            </TooltipText>
          ) : (
            <span className="min-w-0 flex-1">{children}</span>
          )}
        </div>,
        host,
      )
    : null;
}

export type SecondaryItem = {
  id: string;
  href?: string;
  label: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  disabledReason?: string;
};

export type SecondaryItemsProps = {
  title?: string;
  items: SecondaryItem[];
  selected: string;
  onSelect?: (id: string) => void;
};

export function SecondaryItems({
  title,
  items,
  selected,
  onSelect,
}: SecondaryItemsProps) {
  const { close } = useContext(SecondaryContext);
  return (
    <SecondarySection title={title}>
      <div className="sidebar-items">
        {items.map((item) => {
          const content = (
            <>
              {!item.disabled ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "sidebar-item-icon",
                    item.destructive && "text-inherit",
                  )}
                >
                  {item.icon ?? <HugeiconsIcon icon={Menu01Icon} />}
                </span>
              ) : null}
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <span className="inline-flex shrink-0 items-center text-xs font-mono tabular-nums text-muted">
                  {item.badge}
                </span>
              ) : null}
            </>
          );
          const props = {
            "aria-current":
              selected === item.id ? ("page" as const) : undefined,
            title: item.disabledReason,
            "data-disabled": item.disabled || undefined,
            className: menuItemVariants({
              variant: item.destructive ? "danger" : "default",
            }).item({
              className: cn(
                "sidebar-item min-w-0 text-start text-sm font-normal",
                selected === item.id
                  ? item.destructive
                    ? "bg-danger-soft text-danger-soft-foreground"
                    : "bg-default text-foreground"
                  : item.destructive
                    ? "text-danger"
                    : "text-foreground",
              ),
            }),
          };
          return item.href && !item.disabled ? (
            <RouteLink
              key={item.id}
              {...props}
              href={item.href}
              onClick={(event) => {
                if (
                  !event.defaultPrevented &&
                  event.button === 0 &&
                  !event.metaKey &&
                  !event.ctrlKey &&
                  !event.altKey &&
                  !event.shiftKey
                )
                  close();
              }}
            >
              {content}
            </RouteLink>
          ) : (
            <button
              key={item.id}
              {...props}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                onSelect?.(item.id);
                close();
              }}
            >
              {content}
            </button>
          );
        })}
      </div>
    </SecondarySection>
  );
}
