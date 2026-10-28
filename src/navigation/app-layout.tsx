"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { PanelLeftIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { RouteProvider, useRoutePathname } from "../hooks/route-context.js";
import { cn } from "../lib/utils.js";
import { Drawer } from "../overlays/drawer.js";
import { bindSidebarSwipe } from "../lib/sidebar-swipe.js";
import { useNavigationToggleHover } from "../hooks/use-navigation-toggle-hover.js";
import styles from "./app-layout.module.css";
import {
  MobileNavigationContext,
  NavigationContext,
  useAppNavigate,
} from "../hooks/app-navigation.js";

export {
  useAppNavigate,
  useMobileNavigation,
} from "../hooks/app-navigation.js";

const desktopQuery = "(min-width: 64rem)";
const subscribeToViewport = (callback: () => void) => {
  const query = window.matchMedia(desktopQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const isDesktopViewport = () => window.matchMedia(desktopQuery).matches;
const serverViewport = () => false;

export function AppLayout({
  aside,
  asideLabel = "Assistant",
  asideOpen = false,
  children,
  className,
  footer,
  navbar,
  navigate,
  onSidebarOpenChange,
  sidebar,
  sidebarOpen = true,
  onAsideOpenChange,
  toggleShortcut = false,
}: {
  /**
   * Optional right-hand panel, such as the agent chat. Docked beside the page
   * on desktop so the page stays usable; a right drawer on smaller screens.
   */
  aside?: ReactNode;
  asideLabel?: string;
  asideOpen?: boolean;
  onAsideOpenChange?: (open: boolean) => void;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  navbar?: ReactNode;
  navigate?: (href: string) => void;
  onSidebarOpenChange?: (open: boolean) => void;
  scrollMode?: string;
  sidebar?: ReactNode;
  sidebarCollapsible?: string;
  sidebarOpen?: boolean;
  toggleShortcut?: boolean;
}) {
  const closeHover = useNavigationToggleHover();
  const pathname = useRoutePathname();
  const inheritedNavigate = useAppNavigate();
  const previousPathname = useRef(pathname);
  const root = useRef<HTMLDivElement>(null);
  const hasSidebar = Boolean(sidebar);
  const hasAside = Boolean(aside);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const wasDrawerMounted = useRef(false);
  const [restoringFocus, setRestoringFocus] = useState(false);
  const previousSidebarOpen = useRef(sidebarOpen);
  const [presented, setPresented] = useState({
    pathname,
    sidebar,
    navbar,
    children,
  });
  const [mobileHost, setMobileHost] = useState<HTMLElement | null>(null);
  const [secondaryMenuCount, setSecondaryMenuCount] = useState(0);
  const [motionReady, setMotionReady] = useState(false);
  const registerSecondaryNavigation = useCallback(() => {
    setSecondaryMenuCount((count) => count + 1);
    return () => setSecondaryMenuCount((count) => count - 1);
  }, []);
  const isDesktop = useSyncExternalStore(
    subscribeToViewport,
    isDesktopViewport,
    serverViewport,
  );

  const holdNavigation =
    !isDesktop && drawerMounted && presented.pathname !== pathname;
  const visible = holdNavigation
    ? presented
    : { pathname, sidebar, navbar, children };
  const trackDrawer = useCallback((element: HTMLDivElement | null) => {
    setDrawerMounted(Boolean(element));
    setRestoringFocus(!element && wasDrawerMounted.current);
  }, []);
  useLayoutEffect(() => {
    const reopened = sidebarOpen && !previousSidebarOpen.current;
    previousSidebarOpen.current = sidebarOpen;
    if (holdNavigation && !reopened) return;
    setPresented((previous) =>
      previous.pathname === pathname &&
      previous.sidebar === sidebar &&
      previous.navbar === navbar &&
      previous.children === children
        ? previous
        : { pathname, sidebar, navbar, children },
    );
  }, [children, holdNavigation, navbar, pathname, sidebar, sidebarOpen]);

  useLayoutEffect(() => {
    if (
      isDesktop &&
      !sidebarOpen &&
      root.current
        ?.querySelector("aside#application-navigation")
        ?.contains(document.activeElement)
    ) {
      root.current
        .querySelector<HTMLButtonElement>(".navigation-toggle")
        ?.focus({ preventScroll: true });
    }
  }, [isDesktop, sidebarOpen]);

  useLayoutEffect(() => {
    const exited = wasDrawerMounted.current && !drawerMounted;
    wasDrawerMounted.current = drawerMounted;
    if (isDesktop || (sidebarOpen && drawerMounted)) {
      // oxlint-disable-next-line react/set-state-in-effect -- focus restoration follows the drawer's DOM mount state, which is only known after layout
      setRestoringFocus(false);
      return;
    }
    if (!exited) return;

    // The outgoing navbar can disappear before React Aria restores its opener.
    const frame = requestAnimationFrame(() => {
      const element = root.current;
      const document = element?.ownerDocument;
      if (
        !sidebarOpen &&
        document?.hasFocus() &&
        document.activeElement === document.body
      ) {
        const toggle =
          element?.querySelector<HTMLButtonElement>(".navigation-toggle");
        if (
          toggle?.isConnected &&
          !toggle.disabled &&
          !toggle.closest("[inert]")
        ) {
          toggle.focus({ preventScroll: true });
        }
      }
      setRestoringFocus(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [drawerMounted, isDesktop, sidebarOpen]);

  // Small screens show one drawer at a time: the one opened last wins.
  const previousAsideOpen = useRef(false);
  const previousNavigationOpen = useRef(sidebarOpen);
  useEffect(() => {
    const asideOpened = asideOpen && !previousAsideOpen.current;
    const navigationOpened = sidebarOpen && !previousNavigationOpen.current;
    previousAsideOpen.current = asideOpen;
    previousNavigationOpen.current = sidebarOpen;
    if (isDesktop || !hasAside || !asideOpen || !sidebarOpen) return;
    if (navigationOpened && !asideOpened) onAsideOpenChange?.(false);
    else onSidebarOpenChange?.(false);
  }, [
    asideOpen,
    hasAside,
    isDesktop,
    onAsideOpenChange,
    onSidebarOpenChange,
    sidebarOpen,
  ]);

  useLayoutEffect(() => {
    const panel = root.current?.querySelector("aside[data-slot='app-aside']");
    if (isDesktop && !asideOpen && panel?.contains(document.activeElement)) {
      root.current
        ?.querySelector<HTMLButtonElement>("[data-app-aside-trigger]")
        ?.focus({ preventScroll: true });
    }
  }, [asideOpen, isDesktop]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMotionReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (
      isDesktop ||
      sidebarOpen ||
      !hasSidebar ||
      !onSidebarOpenChange ||
      !root.current
    )
      return;
    return bindSidebarSwipe(root.current, () => onSidebarOpenChange(true));
  }, [hasSidebar, isDesktop, onSidebarOpenChange, sidebarOpen]);

  useEffect(() => {
    const routeChanged = previousPathname.current !== pathname;
    previousPathname.current = pathname;
    if (
      routeChanged &&
      onSidebarOpenChange &&
      !window.matchMedia("(min-width: 64rem)").matches
    ) {
      onSidebarOpenChange(false);
    }
  }, [onSidebarOpenChange, pathname]);

  useEffect(() => {
    if (!toggleShortcut) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onSidebarOpenChange?.(!sidebarOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSidebarOpenChange, sidebarOpen, toggleShortcut]);

  return (
    <RouteProvider
      pathname={visible.pathname}
      navigate={navigate ?? inheritedNavigate}
    >
      <NavigationContext.Provider value={navigate ?? inheritedNavigate}>
        <MobileNavigationContext.Provider
          value={{
            host: mobileHost,
            isMobile: !isDesktop,
            isRestoringFocus:
              !isDesktop && (restoringFocus || (drawerMounted && !sidebarOpen)),
            registerSecondaryNavigation,
            close: () => {
              if (!isDesktop) onSidebarOpenChange?.(false);
            },
          }}
        >
          <div
            ref={root}
            data-sidebar-open={sidebarOpen}
            data-has-sidebar={hasSidebar && isDesktop}
            data-has-aside={hasAside && isDesktop}
            data-aside-open={asideOpen}
            data-motion-ready={motionReady}
            className={cn("min-h-dvh", styles.layout, className)}
          >
            {sidebar && isDesktop ? (
              <aside
                id="application-navigation"
                aria-hidden={!sidebarOpen}
                inert={!sidebarOpen}
                className={styles.desktopSidebar}
              >
                <div className={styles.sidebarPanel}>{visible.sidebar}</div>
              </aside>
            ) : null}
            <div
              className={cn(
                "grid min-h-dvh min-w-0 grid-cols-1 grid-rows-[auto_1fr_auto]",
                styles.mainColumn,
              )}
            >
              {visible.navbar}
              <main className="min-w-0">{visible.children}</main>
              {footer}
            </div>
            {aside && isDesktop ? (
              <aside
                aria-label={asideLabel}
                aria-hidden={!asideOpen}
                inert={!asideOpen}
                className={styles.desktopAside}
                data-slot="app-aside"
              >
                <div className={styles.asidePanel}>{aside}</div>
              </aside>
            ) : null}
          </div>
          {aside ? (
            <Drawer.Backdrop
              className={styles.drawerBackdrop}
              isOpen={asideOpen && !isDesktop}
              onOpenChange={onAsideOpenChange}
            >
              <Drawer.Content placement="right">
                <Drawer.Dialog
                  aria-label={asideLabel}
                  className={cn(
                    "grid max-w-none overflow-hidden bg-background p-0",
                    styles.asideDrawerDialog,
                  )}
                >
                  <div className="min-h-0 min-w-0" data-slot="drawer-body">
                    {aside}
                  </div>
                </Drawer.Dialog>
              </Drawer.Content>
            </Drawer.Backdrop>
          ) : null}
          {sidebar ? (
            <Drawer.Backdrop
              className={styles.drawerBackdrop}
              isOpen={sidebarOpen && !isDesktop}
              onOpenChange={onSidebarOpenChange}
            >
              <Drawer.Content placement="left">
                <Drawer.Dialog
                  id="application-navigation"
                  aria-label="Navigation"
                  data-secondary-navigation={secondaryMenuCount > 0}
                  className={cn(
                    "group/navigation grid max-w-[calc(100vw-1rem)] overflow-hidden bg-background p-0",
                    styles.drawerDialog,
                  )}
                >
                  <div
                    ref={trackDrawer}
                    className="relative min-h-0 min-w-0"
                    data-slot="drawer-body"
                  >
                    {visible.sidebar}
                    <Drawer.CloseTrigger
                      {...closeHover}
                      aria-label="Close navigation"
                      className="sidebar-navigation-toggle sidebar-navigation-close end-3 group-data-[secondary-navigation=true]/navigation:hidden"
                    >
                      <HugeiconsIcon
                        aria-hidden
                        icon={PanelLeftIcon}
                        className="m-0 size-[17px]"
                      />
                    </Drawer.CloseTrigger>
                  </div>
                  <div
                    className="hidden min-h-0 min-w-0 flex-col border-s border-separator group-data-[secondary-navigation=true]/navigation:flex"
                    data-slot="drawer-body"
                  >
                    <div className="flex min-h-16 shrink-0 items-center justify-end border-b border-separator px-3">
                      <Drawer.CloseTrigger
                        {...closeHover}
                        aria-label="Close navigation"
                        className="sidebar-navigation-toggle relative inset-auto"
                      >
                        <HugeiconsIcon
                          aria-hidden
                          icon={PanelLeftIcon}
                          className="m-0 size-[17px]"
                        />
                      </Drawer.CloseTrigger>
                    </div>
                    <nav
                      aria-label="Page navigation"
                      ref={setMobileHost}
                      className="sidebar-body sidebar-mobile-body grid min-h-0 flex-1 content-start overflow-y-auto overscroll-contain"
                    />
                  </div>
                </Drawer.Dialog>
              </Drawer.Content>
            </Drawer.Backdrop>
          ) : null}
        </MobileNavigationContext.Provider>
      </NavigationContext.Provider>
    </RouteProvider>
  );
}
