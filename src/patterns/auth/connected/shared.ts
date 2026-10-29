"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AuthClient, AuthSession } from "@avgeek-oss/auth-client";

// Only types come from @avgeek-oss/auth-client: it is an optional peer, so
// nothing here may import it at runtime. Errors are recognised by shape,
// which also works across duplicate copies of the client.

/** The client the containers take. Any app's `AuthClient<Ext>` fits. */
export type ConnectedAuthClient = AuthClient<object>;

/** How containers navigate to sign-in, step-up and provider URLs. */
export type Navigate = (url: string) => void;

export type ConnectedBaseProps = {
  client: ConnectedAuthClient;
  /**
   * Navigates to a sign-in, step-up or provider URL. Default
   * `window.location.assign`.
   */
  navigate?: Navigate;
};

/**
 * A stable navigate that calls the latest one given, so an inline function
 * does not reload data on every render.
 */
export function useNavigate(navigate: Navigate | undefined): Navigate {
  const latest = useRef(navigate);
  // oxlint-disable-next-line react/refs -- keeps the latest navigate for callbacks; render never reads it
  latest.current = navigate;
  return useCallback((url: string) => {
    if (latest.current) latest.current(url);
    else window.location.assign(url);
  }, []);
}

/**
 * Whether the page is navigating away, such as to the provider. Cleared
 * when the browser restores the page from its history cache.
 */
export function useLeaving() {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const restored = (event: PageTransitionEvent) => {
      if (event.persisted) setLeaving(false);
    };
    window.addEventListener("pageshow", restored);
    return () => window.removeEventListener("pageshow", restored);
  }, []);
  return [leaving, setLeaving] as const;
}

/** The code of an `AuthClientError`, or `null` for anything else. */
export function authErrorCode(error: unknown): string | null {
  if (!(error instanceof Error) || error.name !== "AuthClientError")
    return null;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

const ERROR_PARAMS = ["auth_error", "auth_error_reason"];

/** The page's path and query without the callback's error parameters. */
export function currentPath(): string {
  const url = new URL(window.location.href);
  for (const name of ERROR_PARAMS) url.searchParams.delete(name);
  return `${url.pathname}${url.search}${url.hash}`;
}

/** `?auth_error=` from the page's URL, as `readAuthRedirectError` reads it. */
export function readRedirectError(): {
  code: string;
  reason: string | null;
} | null {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("auth_error");
  return code
    ? { code, reason: params.get("auth_error_reason") || null }
    : null;
}

/** Removes the callback's error parameters, so a reload does not repeat it. */
export function clearRedirectError() {
  const params = new URLSearchParams(window.location.search);
  if (!ERROR_PARAMS.some((name) => params.has(name))) return;
  window.history.replaceState(window.history.state, "", currentPath());
}

type SessionState =
  | { status: "loading" }
  | { status: "signed-in"; session: AuthSession<object> }
  | { status: "error"; message: string };

/**
 * The session. Signed-out visitors are sent to sign-in, coming back to
 * this page.
 */
export function useConnectedSession(
  client: ConnectedAuthClient,
  navigate: Navigate,
) {
  const [state, setState] = useState<SessionState>({ status: "loading" });
  const fetchSession = useCallback(async () => {
    try {
      const session = await client.getSession();
      if (session) setState({ status: "signed-in", session });
      else navigate(client.signInUrl(currentPath()));
    } catch (error) {
      setState({
        status: "error",
        message: errorMessage(error, "Could not load your session."),
      });
    }
  }, [client, navigate]);
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- loads from the auth API; state changes only once it answers
    void fetchSession();
  }, [fetchSession]);
  const reload = useCallback(() => {
    setState({ status: "loading" });
    return fetchSession();
  }, [fetchSession]);
  return { state, reload };
}

type ListState<T> =
  | { status: "loading" }
  | { status: "ready"; items: T[] }
  | { status: "error"; message: string };

/** A list from the client, with a setter for optimistic changes. */
export function useConnectedList<T>(load: () => Promise<T[]>, failure: string) {
  const [state, setState] = useState<ListState<T>>({ status: "loading" });
  const loadRef = useRef(load);
  // oxlint-disable-next-line react/refs -- keeps the latest loader for refetches; render never reads it
  loadRef.current = load;
  const latest = useRef(0);
  const refetch = useCallback(async () => {
    const ticket = ++latest.current;
    try {
      const items = await loadRef.current();
      if (ticket === latest.current) setState({ status: "ready", items });
    } catch (error) {
      if (ticket === latest.current)
        setState((previous) =>
          // Keep loaded rows when a background reload fails.
          previous.status === "ready"
            ? previous
            : { status: "error", message: errorMessage(error, failure) },
        );
    }
  }, [failure]);
  useEffect(() => {
    void refetch();
    const counter = latest;
    return () => {
      // Answers to a request made before unmounting are dropped.
      counter.current++;
    };
  }, [refetch]);
  const update = useCallback((change: (items: T[]) => T[]) => {
    // A local change supersedes any reload still in flight.
    latest.current++;
    setState((previous) =>
      previous.status === "ready"
        ? { status: "ready", items: change(previous.items) }
        : previous,
    );
  }, []);
  const retry = useCallback(() => {
    setState({ status: "loading" });
    void refetch();
  }, [refetch]);
  return { state, refetch, update, retry };
}

const STEP_UP_KEY = "avgeek-oss-design-system:step-up";
// A step-up abandoned at the provider must not replay much later.
const STEP_UP_TTL_MS = 10 * 60_000;

/** An action to repeat after step-up, with the input it needs. */
export type StepUpResume = { action: string; input: unknown };

type StepUpRequest = StepUpResume & { reason: ReactNode };

/**
 * The input of `action` if the person just came back from step-up for it
 * to this page, once; otherwise `undefined`. Reads session storage, so call
 * it from an effect or event, never while rendering.
 */
export function takeStepUpResume(action: string): unknown {
  try {
    const saved = window.sessionStorage.getItem(STEP_UP_KEY);
    if (saved === null) return undefined;
    const entry = JSON.parse(saved) as {
      action?: unknown;
      input?: unknown;
      path?: unknown;
      at?: unknown;
    };
    const here = entry.path === currentPath().split("#")[0];
    // An entry for another page or an abandoned step-up is dropped.
    if (
      !here ||
      typeof entry.at !== "number" ||
      Date.now() - entry.at >= STEP_UP_TTL_MS
    ) {
      window.sessionStorage.removeItem(STEP_UP_KEY);
      return undefined;
    }
    if (entry.action !== action) return undefined;
    window.sessionStorage.removeItem(STEP_UP_KEY);
    // A failed step-up comes back with ?auth_error=: nothing to repeat.
    return readRedirectError() === null ? entry.input : undefined;
  } catch {
    // No storage (private mode) or a corrupt entry: nothing to resume.
    return undefined;
  }
}

/**
 * Step-up for a container: `requireStepUp` opens the dialog for a
 * `step_up_required` failure; continuing records the action and sends the
 * person to the provider with this page as `returnTo`. When they come back,
 * `takeStepUpResume` returns the action's input once.
 */
export function useStepUpFlow(client: ConnectedAuthClient, navigate: Navigate) {
  const [request, setRequest] = useState<StepUpRequest | null>(null);
  const [isPending, setPending] = useState(false);
  const requireStepUp = useCallback(
    (resume: StepUpResume, reason: ReactNode) => {
      setPending(false);
      setRequest({ ...resume, reason });
    },
    [],
  );
  const proceed = useCallback(() => {
    if (!request) return;
    const path = currentPath();
    try {
      window.sessionStorage.setItem(
        STEP_UP_KEY,
        JSON.stringify({
          action: request.action,
          input: request.input,
          path: path.split("#")[0],
          at: Date.now(),
        }),
      );
    } catch {
      // Without storage the person repeats the action after confirming.
    }
    setPending(true);
    navigate(client.stepUpUrl(path));
  }, [client, navigate, request]);
  return {
    dialog: {
      isOpen: request !== null,
      reason: request?.reason,
      isPending,
      onContinue: proceed,
      onOpenChange: (open: boolean) => {
        if (!open && !isPending) setRequest(null);
      },
    },
    requireStepUp,
  };
}
