"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ConsentRequest, Role } from "@avgeek-oss/auth-client";
import { Button } from "../../../buttons/button.js";
import { Alert } from "../../../feedback/alert.js";
import { toast } from "../../../overlays/toast.js";
import { QueryLoading } from "../../feedback/query-state.js";
import type { ChoiceOption } from "../../choice-field.js";
import { AuthScreen } from "../auth-screen.js";
import { McpAuthorization } from "../mcp-authorization.js";
import { StepUpDialog } from "../step-up-dialog.js";
import {
  authErrorCode,
  currentPath,
  errorMessage,
  takeStepUpResume,
  useNavigate,
  useStepUpFlow,
  type ConnectedBaseProps,
} from "./shared.js";

export type ConnectedMcpConsentWorkspaces = {
  options: readonly ChoiceOption[];
  label?: string;
  /**
   * The app-defined restrictions for the chosen workspace, which the app's
   * `validateRestrictions` hook checks, such as `{ workspace: id }`.
   */
  restrictions: (workspace: string) => Readonly<Record<string, unknown>>;
};

export type ConnectedMcpConsentProps = ConnectedBaseProps & {
  brand: ReactNode;
  productName: string;
  providerName: string;
  /** The consent request id. Default: the page's `?request=`. */
  requestId?: string | null;
  /** A logo for the client, instead of the one it registered. */
  clientLogo?: ReactNode;
  /** Offers a workspace limit, for apps whose grants can be scoped. */
  workspaces?: ConnectedMcpConsentWorkspaces;
};

type State =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "error"; message: string }
  | { status: "ready"; request: ConsentRequest; id: string };

const UNCERTAIN = new Set(["network_error", "invalid_response"]);

/**
 * The MCP consent page: signs the person in if needed, loads the request,
 * and approves or denies it with the chosen role ceiling, stepping up
 * first for an admin ceiling, then sends the browser back to the client.
 */
export function ConnectedMcpConsent({
  client,
  navigate: navigateProp,
  brand,
  productName,
  providerName,
  requestId: requestIdProp,
  clientLogo,
  workspaces,
}: ConnectedMcpConsentProps) {
  const navigate = useNavigate(navigateProp);
  const stepUp = useStepUpFlow(client, navigate);
  const { requireStepUp } = stepUp;
  const [state, setState] = useState<State>({ status: "loading" });
  const [ceiling, setCeiling] = useState<Role | null>(null);
  const [workspace, setWorkspace] = useState("");
  const [isPending, setPending] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);
  const deciding = useRef(false);

  const decide = useCallback(
    async (
      request: ConsentRequest,
      id: string,
      approve: boolean,
      choice: { ceiling: Role; workspace: string },
    ) => {
      if (deciding.current) return;
      deciding.current = true;
      setPending(true);
      let leaving = false;
      try {
        const decision = await client.consent.decide(id, {
          approve,
          ...(approve ? { ceiling: choice.ceiling } : {}),
          ...(approve && workspaces
            ? { restrictions: workspaces.restrictions(choice.workspace) }
            : {}),
        });
        leaving = true;
        navigate(decision.redirectUri);
      } catch (error) {
        const code = authErrorCode(error);
        if (code === "step_up_required")
          requireStepUp(
            { action: "consent:approve", input: { id, ...choice } },
            `Allowing ${request.client.name} to act as an admin needs a recent sign-in.`,
          );
        else if (code === "unauthenticated") {
          leaving = true;
          navigate(client.signInUrl(currentPath()));
        } else if (code !== null && UNCERTAIN.has(code))
          // The decision may have been recorded; sending it again could
          // fail or mislead, so the client must start over.
          setBlocked(
            `Your decision could not be confirmed. Start the connection again from ${request.client.name}.`,
          );
        else toast.danger(errorMessage(error, "Could not send your decision."));
      } finally {
        deciding.current = false;
        if (!leaving) setPending(false);
      }
    },
    [client, navigate, requireStepUp, workspaces],
  );

  const fetchRequest = useCallback(async () => {
    try {
      const session = await client.getSession();
      if (!session) {
        navigate(client.signInUrl(currentPath()));
        return;
      }
      const id =
        requestIdProp !== undefined
          ? requestIdProp
          : new URLSearchParams(window.location.search).get("request");
      if (id === null) {
        setState({ status: "missing" });
        return;
      }
      const request = await client.consent.get(id);
      setState({ status: "ready", request, id });
      // Back from step-up: approve with what the person chose before.
      const saved = takeStepUpResume("consent:approve") as
        { id?: unknown; ceiling?: unknown; workspace?: unknown } | undefined;
      if (
        saved?.id === id &&
        typeof saved.ceiling === "string" &&
        request.ceilings.includes(saved.ceiling as Role)
      ) {
        const choice = {
          ceiling: saved.ceiling as Role,
          workspace: typeof saved.workspace === "string" ? saved.workspace : "",
        };
        setCeiling(choice.ceiling);
        setWorkspace(choice.workspace);
        await decide(request, id, true, choice);
      }
    } catch (error) {
      setState(
        authErrorCode(error) === "not_found"
          ? { status: "missing" }
          : {
              status: "error",
              message: errorMessage(error, "Could not load the request."),
            },
      );
    }
  }, [client, decide, navigate, requestIdProp]);
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- loads from the auth API; state changes only once it answers
    void fetchRequest();
  }, [fetchRequest]);
  const retry = () => {
    setState({ status: "loading" });
    void fetchRequest();
  };

  if (state.status === "loading")
    return (
      <AuthScreen brand={brand} title="Connect to an app">
        <QueryLoading>Loading the request…</QueryLoading>
      </AuthScreen>
    );
  if (state.status === "missing")
    return (
      <AuthScreen
        brand={brand}
        title="This request has expired"
        description="It was already used, or it took too long. Start the connection again from the app."
      >
        {null}
      </AuthScreen>
    );
  if (state.status === "error")
    return (
      <AuthScreen brand={brand} title="Connect to an app">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Could not load the request</Alert.Title>
            <Alert.Description>{state.message}</Alert.Description>
          </Alert.Content>
        </Alert>
        <Button variant="secondary" onPress={retry}>
          Retry
        </Button>
      </AuthScreen>
    );
  const { request, id } = state;
  const chosen = ceiling ?? request.defaultCeiling;
  return (
    <>
      <McpAuthorization
        brand={brand}
        productName={productName}
        client={{
          name: request.client.name,
          id: request.client.id,
          logo: clientLogo,
          logoUri: request.client.logoUri,
          redirectHost: request.client.redirectHost,
          localhost: request.client.localhost,
        }}
        resources={[request.resource]}
        ceiling={chosen}
        ceilings={request.ceilings}
        onCeilingChange={setCeiling}
        workspace={
          workspaces
            ? {
                options: workspaces.options,
                label: workspaces.label,
                value: workspace,
                onChange: setWorkspace,
              }
            : undefined
        }
        isPending={isPending}
        isDisabled={blocked !== null}
        approvalBlockedReason={blocked ?? undefined}
        onApprove={() =>
          void decide(request, id, true, { ceiling: chosen, workspace })
        }
        onDeny={() =>
          void decide(request, id, false, { ceiling: chosen, workspace })
        }
      />
      <StepUpDialog providerName={providerName} {...stepUp.dialog} />
    </>
  );
}
