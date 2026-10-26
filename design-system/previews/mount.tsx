import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { RouteProvider } from "../namespace.js";

// Cards render inside the design-system page's frame, so links must not navigate it.
export function mount(element: ReactNode) {
  const root = document.getElementById("root");
  if (!root) throw new Error("Preview root element is missing.");
  createRoot(root).render(
    <RouteProvider pathname="/" navigate={() => undefined}>
      {element}
    </RouteProvider>,
  );
}
