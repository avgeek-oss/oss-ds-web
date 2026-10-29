import { useRef, useState } from "react";
import { usePreviewOptions } from "./preview-options";
import { preferenceOptions } from "./preference-options";
import { BrandLockup } from "../src/media/brand-lockup";
import { AvgeekLogo } from "./avgeek-brand";
import { Button } from "../src/buttons/button";
import { toast } from "../src/overlays/toast";
import { SignIn } from "../src/patterns/auth/sign-in";
import { AccessDenied } from "../src/patterns/auth/access-denied";
import { StepUpDialog } from "../src/patterns/auth/step-up-dialog";
import { TeamSetup } from "../src/patterns/auth/team-setup";
import { McpAuthorization } from "../src/patterns/auth/mcp-authorization";
import type { TeamRole } from "../src/patterns/team-settings/team-role-options";

export const authPreviewBrand = (
  <BrandLockup logo={<AvgeekLogo />}>Avgeek</BrandLockup>
);
const brand = authPreviewBrand;
export const previewProvider = "authentik";
export type AuthPreviewScreen = "SignIn" | "TeamSetup" | "AccessDenied";

export function useAuthPreviewSubmit() {
  const { slowResponse: slow } = usePreviewOptions();
  const { failRequest: fail } = usePreviewOptions();
  return async () => {
    if (slow) await new Promise((resolve) => setTimeout(resolve, 1200));
    if (fail)
      throw new Error(
        "Unable to continue. Your fields are retained. Try again.",
      );
  };
}

export function AuthPreview({ initial }: { initial: AuthPreviewScreen }) {
  const [screen, setScreen] = useState(initial);
  const [setupRequests, setSetupRequests] = useState(0);
  const submit = useAuthPreviewSubmit();
  const views = {
    SignIn: (
      <SignIn
        brand={brand}
        productName="Avgeek"
        providerName={previewProvider}
        onContinue={() => toast.info("Preview: continue to authentik")}
      />
    ),
    AccessDenied: (
      <AccessDenied
        brand={brand}
        productName="Avgeek"
        providerName={previewProvider}
        onTryAgain={() => setScreen("SignIn")}
      />
    ),
    TeamSetup: (
      <TeamSetup
        brand={brand}
        preferenceOptions={preferenceOptions}
        onSubmit={async () => {
          setSetupRequests(setupRequests + 1);
          await submit();
          toast.success("Preview completed");
        }}
      />
    ),
  };
  return <div data-setup-requests={setupRequests}>{views[screen]}</div>;
}

export function StepUpPreview({
  reason,
  pending = false,
}: {
  reason?: string;
  pending?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(pending);
  return (
    <div className="p-5">
      <Button onPress={() => setOpen(true)}>Delete workspace</Button>
      <StepUpDialog
        isOpen={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setStarted(false);
        }}
        providerName={previewProvider}
        reason={reason}
        isPending={started}
        onContinue={() => {
          setStarted(true);
          toast.info("Preview: continue to authentik");
        }}
      />
    </div>
  );
}

export function ConsentPreview({
  clientName = "Example MCP client",
  viewerRole = false,
  slowRequest = false,
  localhost = false,
  workspaces = false,
}: {
  clientName?: string;
  viewerRole?: boolean;
  slowRequest?: boolean;
  localhost?: boolean;
  workspaces?: boolean;
}) {
  const options = usePreviewOptions();
  const viewer = options.viewerRole ?? viewerRole;
  const slow = options.slowAuthorization ?? slowRequest;
  const fail = options.authorizationFailure;
  const ceilings: TeamRole[] = viewer
    ? ["viewer"]
    : ["viewer", "member", "admin"];
  const [ceiling, setCeiling] = useState<TeamRole>("viewer");
  const [workspace, setWorkspace] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const requestPending = useRef(false);
  async function decide(allow: boolean) {
    if (requestPending.current) return;
    requestPending.current = true;
    setPending(true);
    setError(undefined);
    try {
      if (slow) await new Promise((resolve) => setTimeout(resolve, 1200));
      if (fail) throw new Error("Unable to connect this app. Try again.");
      toast.success(
        allow ? "Preview connection approved" : "Preview connection denied",
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to connect this app.",
      );
    } finally {
      requestPending.current = false;
      setPending(false);
    }
  }
  return (
    <McpAuthorization
      brand={brand}
      productName="Towbar"
      client={{
        name: clientName,
        id: "https://client.example.test/oauth/client.json",
        logo: (
          <span aria-hidden className="font-medium">
            C
          </span>
        ),
        redirectHost: localhost ? "127.0.0.1:53682" : "client.example.test",
        localhost,
      }}
      resources={[{ uri: "https://api.towbar.example.test/mcp", name: "MCP" }]}
      ceiling={ceiling}
      ceilings={ceilings}
      onCeilingChange={setCeiling}
      workspace={
        workspaces
          ? {
              options: [
                { id: "ops", label: "Operations" },
                { id: "fleet", label: "Fleet" },
              ],
              value: workspace,
              onChange: setWorkspace,
            }
          : undefined
      }
      isPending={pending}
      error={error}
      onApprove={() => void decide(true)}
      onDeny={() => void decide(false)}
    />
  );
}
