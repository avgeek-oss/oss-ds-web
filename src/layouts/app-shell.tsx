"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react";
import { PanelLeftIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { menuItemVariants } from "@heroui/styles";
import { Button as AriaButton } from "react-aria-components";
import { useRoutePathname } from "../hooks/route-context.js";
import { useNavigationToggleHover } from "../hooks/use-navigation-toggle-hover.js";
import { Button } from "../buttons/button.js";
import { AlertDialog } from "../overlays/alert-dialog.js";
import { Toast } from "../overlays/toast.js";
import { ThemeSwitcher } from "../controls/theme-switcher.js";
import { cn } from "../lib/utils.js";
import { BrandLockup } from "../media/brand-lockup.js";
import {
  useAppNavigate,
  useMobileNavigation,
} from "../hooks/app-navigation.js";
import { BreadcrumbTrail } from "../navigation/breadcrumbs.js";
import { InlineExternalLink } from "../navigation/inline-external-link.js";
import {
  AppShellBoundary,
  useAppShellHeaderState,
} from "./app-shell-boundary.js";
import type {
  ApplicationPolicy,
  ContentWidth,
  FooterConfig,
  HeaderConfig,
  SidebarConfig,
  SidebarActionConfig,
  ShellLinkConfig,
} from "./application-shell-types.js";

const widths: Record<ContentWidth, string> = {
  small: "max-w-3xl",
  compact: "max-w-5xl",
  relaxed: "max-w-6xl",
  broad: "max-w-7xl",
  full: "max-w-none",
};
const ContentWidthContext = createContext<ContentWidth>("relaxed");
function Root({
  children,
  contentWidth = "relaxed",
  policy,
  className,
  ...props
}: ComponentProps<"div"> & {
  contentWidth?: ContentWidth;
  policy: ApplicationPolicy;
}) {
  return (
    <ContentWidthContext.Provider value={contentWidth}>
      <AppShellBoundary>
        <div className={cn("min-h-dvh", className)} {...props}>
          {children}
          {policy.toasts ? <Toast.Provider placement="bottom" /> : null}
        </div>
      </AppShellBoundary>
    </ContentWidthContext.Provider>
  );
}
function Content({
  className,
  variant,
  ...props
}: ComponentProps<"div"> & { variant?: ContentWidth }) {
  const contentWidth = useContext(ContentWidthContext);
  return (
    <div
      className={cn(
        "mx-auto min-h-full w-full min-w-0 px-4 pt-0 pb-4",
        widths[variant ?? contentWidth],
        className,
      )}
      {...props}
    />
  );
}
export const AppShell = Object.assign(Root, { Content, Root });

function isCurrentLink(item: ShellLinkConfig, pathname: string) {
  const path = item.activePath ?? item.href;
  return (
    !item.external &&
    (pathname === path || (path !== "/" && pathname.startsWith(`${path}/`)))
  );
}

function RoutedLink({
  item,
  className,
  children,
  tabIndex,
}: {
  item: ShellLinkConfig;
  className?: string;
  children?: ReactNode;
  tabIndex?: number;
}) {
  const navigate = useAppNavigate();
  const pathname = useRoutePathname();
  const { close } = useMobileNavigation();
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    if (!item.external && navigate) {
      event.preventDefault();
      if (
        pathname !== item.href &&
        !(item.preserveSubroute && isCurrentLink(item, pathname))
      )
        navigate(item.href);
    }
    close();
  };
  if (item.external) {
    return (
      <InlineExternalLink
        aria-label={item.accessibleLabel}
        className={className}
        href={item.href}
        tabIndex={tabIndex}
        onClick={onClick}
      >
        {children ?? item.label}
      </InlineExternalLink>
    );
  }
  return (
    <a
      aria-label={item.accessibleLabel}
      aria-current={isCurrentLink(item, pathname) ? "page" : undefined}
      className={className}
      href={item.href}
      tabIndex={tabIndex}
      onClick={onClick}
    >
      {children ?? item.label}
    </a>
  );
}
export function ApplicationNavbar({
  actions,
  config,
  hasSidebar = false,
  onSidebarToggle,
  sidebarOpen,
  showThemeSwitcher = false,
}: {
  actions?: ReactNode;
  config: HeaderConfig;
  hasSidebar?: boolean;
  onSidebarToggle?: () => void;
  sidebarOpen?: boolean;
  showThemeSwitcher?: boolean;
}) {
  const toggleHover = useNavigationToggleHover();
  const { breadcrumbItems } = useAppShellHeaderState();
  const homeItem: ShellLinkConfig = {
    id: "home",
    kind: "link",
    href: config.homeHref,
    label: config.brand.title,
  };
  return (
    <header className="sticky top-[var(--app-shell-top-offset,0px)] z-30 flex min-h-16 items-center justify-between gap-5 border-b border-separator bg-background/90 pl-3 pr-4 backdrop-blur">
      <div className="flex min-w-0 items-center gap-2">
        {hasSidebar ? (
          <Button
            {...toggleHover}
            aria-label="Toggle navigation"
            aria-expanded={sidebarOpen}
            aria-controls={sidebarOpen ? "application-navigation" : undefined}
            className="navigation-toggle sidebar-navigation-toggle shrink-0"
            isIconOnly
            onPress={onSidebarToggle}
            variant="ghost"
          >
            <HugeiconsIcon
              aria-hidden="true"
              className="m-0 size-[17px]"
              icon={PanelLeftIcon}
            />
          </Button>
        ) : (
          <RoutedLink
            className="inline-flex min-w-0 items-center"
            item={homeItem}
          >
            <BrandLockup
              logo={
                config.brand.logo ??
                (config.brand.logoSrc ? (
                  <img alt="" className="size-8" src={config.brand.logoSrc} />
                ) : null)
              }
            >
              {config.brand.title}
            </BrandLockup>
          </RoutedLink>
        )}
        {hasSidebar && breadcrumbItems ? (
          <BreadcrumbTrail
            className="hidden lg:block"
            items={breadcrumbItems}
          />
        ) : null}
      </div>
      <nav
        aria-label="Primary navigation"
        className="flex shrink-0 items-center gap-5 text-sm"
      >
        {config.navigation?.map((item) => (
          <RoutedLink
            className="text-muted hover:text-foreground"
            item={item}
            key={item.id}
          />
        ))}
        {config.callToAction ? (
          <RoutedLink
            className="rounded-full bg-accent px-4 py-2 font-medium text-accent-foreground"
            item={config.callToAction}
          />
        ) : null}
        {actions || showThemeSwitcher ? (
          <div className="flex items-center gap-2">
            {actions}
            {showThemeSwitcher ? <ThemeSwitcher /> : null}
          </div>
        ) : null}
      </nav>
    </header>
  );
}
export function ApplicationSidebar({ config }: { config: SidebarConfig }) {
  const pathname = useRoutePathname();
  const homeItem: ShellLinkConfig = {
    id: "home",
    kind: "link",
    href: config.homeHref,
    label: config.brand.title,
  };
  const updateLabel = config.brandUpdateVersion
    ? `${config.brandVersion ? `Version ${config.brandVersion}. ` : ""}Update available: version ${config.brandUpdateVersion}`
    : undefined;
  const versionContent = (
    <>
      {config.brandVersion ? (
        <span aria-label={`Version ${config.brandVersion}`}>
          v{config.brandVersion}
        </span>
      ) : null}
      {config.brandUpdateVersion ? (
        <span
          aria-hidden="true"
          data-slot="brand-update-indicator"
          className="size-1.5 shrink-0 rounded-full bg-[var(--version-update-indicator)]"
        />
      ) : null}
      {config.brandUpdateVersion && !config.brandUpdateHref ? (
        <span className="sr-only">
          Update available: version {config.brandUpdateVersion}
        </span>
      ) : null}
    </>
  );
  return (
    <nav
      aria-label={config.accessibleLabel}
      className="flex h-full min-h-0 flex-col overflow-hidden"
    >
      <div className="inline-flex min-h-16 min-w-0 shrink-0 items-center gap-2.5 border-b border-separator px-4">
        <BrandLockup
          logo={
            <RoutedLink
              className="inline-grid size-8 place-items-center"
              item={homeItem}
              tabIndex={-1}
            >
              {config.brand.logo ??
                (config.brand.logoSrc ? (
                  <img alt="" className="size-8" src={config.brand.logoSrc} />
                ) : null)}
            </RoutedLink>
          }
        >
          <span className="flex min-w-0 flex-col gap-0.5 lg:flex-row lg:items-baseline lg:gap-2.5">
            <RoutedLink className="truncate" item={homeItem}>
              {config.brand.title}
            </RoutedLink>
            {config.brandVersion || config.brandUpdateVersion ? (
              <span
                className="inline-flex shrink-0 items-center font-mono text-xs font-normal text-muted"
                title={
                  config.brandUpdateVersion
                    ? `${config.brand.title} v${config.brandUpdateVersion} is available`
                    : undefined
                }
              >
                {config.brandUpdateVersion && config.brandUpdateHref ? (
                  <RoutedLink
                    className="inline-flex items-center gap-1.5 rounded-sm"
                    item={{
                      id: "brand-update",
                      kind: "link",
                      href: config.brandUpdateHref,
                      label: "Update available",
                      accessibleLabel: updateLabel,
                    }}
                  >
                    {versionContent}
                  </RoutedLink>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    {versionContent}
                  </span>
                )}
              </span>
            ) : null}
          </span>
        </BrandLockup>
      </div>
      <div className="sidebar-body grid min-h-0 flex-1 content-start overflow-y-auto overscroll-contain">
        {config.workspace}
        {config.groups.map((group) => (
          <section className="sidebar-section" key={group.id}>
            {group.label ? (
              <h2 className="sidebar-section-heading">{group.label}</h2>
            ) : null}
            <div className="sidebar-items">
              {group.items.map((item) =>
                item.kind === "link" ? (
                  <RoutedLink
                    className={menuItemVariants().item({
                      className: cn(
                        "sidebar-item min-w-0 text-sm font-normal text-foreground",
                        isCurrentLink(item, pathname) && "bg-default",
                      ),
                    })}
                    item={item}
                    key={item.id}
                  >
                    {item.icon ? (
                      <span aria-hidden="true" className="sidebar-item-icon">
                        <HugeiconsIcon icon={item.icon} size={17} />
                      </span>
                    ) : null}
                    <span className="min-w-0 flex-1 truncate">
                      {item.label}
                    </span>
                    {item.trailing}
                    {item.badge ? (
                      <span
                        aria-label={item.badge.label}
                        title={item.badge.label}
                        className={cn(
                          "ms-auto min-w-4 shrink-0 text-xs font-mono tabular-nums lg:min-w-5",
                          item.badge.tone === "warning"
                            ? "rounded-full px-1.5 py-0.5 text-center font-medium"
                            : "text-end",
                          !item.badge.tone && "text-muted",
                          item.badge.tone === "danger" && "text-danger",
                          item.badge.tone === "warning" &&
                            "bg-[var(--warning-soft)] text-warning-soft-foreground",
                        )}
                      >
                        {item.badge.value}
                      </span>
                    ) : null}
                  </RoutedLink>
                ) : (
                  <SidebarAction item={item} key={item.id} />
                ),
              )}
            </div>
          </section>
        ))}
      </div>
      {config.footerContent ? (
        <div className="shrink-0 border-t border-separator pb-[env(safe-area-inset-bottom)] group-data-[collapsible=icon]:hidden">
          {config.footerContent}
        </div>
      ) : null}
      {config.footerActions?.length ? (
        <div className="sidebar-body sidebar-items shrink-0 border-t border-separator">
          {config.footerActions.map((item) => (
            <SidebarAction item={item} key={item.id} />
          ))}
        </div>
      ) : null}
    </nav>
  );
}

function SidebarAction({ item }: { item: SidebarActionConfig }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const trigger = (
    <AriaButton
      aria-label={item.accessibleLabel}
      className={menuItemVariants({
        variant: item.destructive ? "danger" : "default",
      }).item({
        className: cn(
          "sidebar-item min-w-0 text-start text-sm font-normal",
          item.destructive ? "text-danger" : "text-foreground",
        ),
      })}
      isDisabled={item.disabled}
      onPress={() => {
        if (item.confirmation) setIsConfirming(true);
        else item.onSelect();
      }}
      type="button"
    >
      {item.icon ? (
        <span
          aria-hidden="true"
          className={cn(
            "sidebar-item-icon",
            item.destructive && "text-inherit",
          )}
        >
          <HugeiconsIcon icon={item.icon} size={17} />
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </AriaButton>
  );

  if (!item.confirmation) return trigger;

  return (
    <>
      {trigger}
      <AlertDialog.Backdrop
        isOpen={isConfirming}
        onOpenChange={setIsConfirming}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.Header>
              <AlertDialog.Heading>
                {item.confirmation.title}
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>{item.confirmation.description}</AlertDialog.Body>
            <AlertDialog.Footer>
              <Button
                variant="secondary"
                onPress={() => setIsConfirming(false)}
              >
                {item.confirmation.cancelLabel}
              </Button>
              <Button
                variant={item.destructive ? "danger" : "primary"}
                onPress={() => {
                  setIsConfirming(false);
                  item.onSelect();
                }}
              >
                {item.confirmation.confirmLabel}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </>
  );
}
export function ApplicationFooter({
  config,
}: {
  config: FooterConfig;
  policy?: ApplicationPolicy;
}) {
  const copyright = (
    config.copyright ?? `© {year} ${config.brand.title}`
  ).replace("{year}", String(new Date().getFullYear()));
  return (
    <footer className="border-t border-separator px-6 py-10">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-[1fr_auto]">
        <div className="grid gap-2">
          <strong>{config.brand.title}</strong>
          {config.description ? (
            <p className="max-w-md text-sm text-muted">{config.description}</p>
          ) : null}
          <p className="text-xs text-muted">{copyright}</p>
        </div>
        <div className="flex gap-10">
          {config.linkGroups?.map((group) => (
            <div className="grid content-start gap-2 text-sm" key={group.id}>
              <strong>{group.title}</strong>
              {group.links.map((item) => (
                <RoutedLink
                  className="text-muted hover:text-foreground"
                  item={item}
                  key={item.id}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
export function usePersistentAppSidebar(storageKey = "avgeek-oss-sidebar") {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useLayoutEffect(() => {
    const query = window.matchMedia("(min-width: 64rem)");
    const restoreSidebar = () => {
      let open = query.matches;
      try {
        if (query.matches) open = localStorage.getItem(storageKey) !== "false";
      } catch {
        // Storage can be unavailable in private browsing or hardened browsers.
      }
      setSidebarOpen(open);
    };
    restoreSidebar();
    query.addEventListener("change", restoreSidebar);
    return () => query.removeEventListener("change", restoreSidebar);
  }, [storageKey]);
  const onSidebarOpenChange = useCallback(
    (open: boolean) => {
      setSidebarOpen(open);
      try {
        if (window.matchMedia("(min-width: 64rem)").matches) {
          localStorage.setItem(storageKey, String(open));
        }
      } catch {
        // Sidebar state is a convenience; navigation still works without it.
      }
    },
    [storageKey],
  );
  return { onSidebarOpenChange, sidebarOpen };
}
