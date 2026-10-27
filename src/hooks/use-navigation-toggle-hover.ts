"use client";

import { useState } from "react";

export function useNavigationToggleHover() {
  const [isSuppressed, setSuppressed] = useState(false);
  return {
    "data-hover-suppressed": isSuppressed || undefined,
    onPressStart: () => setSuppressed(true),
    onHoverStart: () => setSuppressed(false),
  };
}
