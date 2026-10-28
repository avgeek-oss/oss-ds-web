"use client";

import { useId, useLayoutEffect, useRef } from "react";

import type { AppShellBreadcrumbItems } from "./application-shell-types.js";
import { useRequiredAppShell } from "./app-shell-boundary.js";

export function AppShellBreadcrumb({
  items,
  title = items.at(-1)?.label ?? "",
}: {
  items: AppShellBreadcrumbItems;
  title?: string;
}) {
  const id = useId();
  const registrationRef = useRef({ items, title });
  const { registerBreadcrumb, unregisterBreadcrumb } =
    useRequiredAppShell("AppShellBreadcrumb");
  const registrationKey = JSON.stringify({
    items: items.map(({ contentKey, href, label }) => ({
      contentKey,
      href,
      label,
    })),
    title,
  });

  // oxlint-disable-next-line react/refs -- keeps the latest registration for the layout effect, which reads it after commit
  registrationRef.current = { items, title };

  useLayoutEffect(() => {
    const registration = registrationRef.current;
    registerBreadcrumb(id, registration.items, registration.title);
    return () => unregisterBreadcrumb(id);
  }, [id, registerBreadcrumb, registrationKey, unregisterBreadcrumb]);

  return null;
}
