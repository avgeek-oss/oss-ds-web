import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { UNSAFE_PortalProvider } from "react-aria";
import { OverlaySuspensionScope } from "../../../src/overlays/overlay-suspension";
import { Modal } from "../../../src/overlays/modal";
import { AlertDialog } from "../../../src/overlays/alert-dialog";
import { Dropdown } from "../../../src/overlays/dropdown";
import { Popover } from "../../../src/overlays/popover";
import { Button } from "../../../src/buttons/button";
import { CreateApiKeyDialog } from "../../../src/patterns/account-settings/create-api-key-dialog";
import { ActionConfirmation } from "../../../src/patterns/actions/action-confirmation";
import { CodeBlock } from "../../../src/typography/code-block";
import { PreferencesSettingsPreview } from "../../../studio/account-settings-previews";

type Kind = "key" | "confirmation" | "modal" | "alert" | "dropdown" | "popover";
type ClipboardKind = "code" | "preferences";
function SuspensionPreview({
  kind,
  rerenderOnClose = false,
  moveFocusOnClose = false,
}: {
  kind: Kind | ClipboardKind;
  rerenderOnClose?: boolean;
  moveFocusOnClose?: boolean;
}) {
  const [suspended, setSuspended] = useState(false);
  const [owner, setOwner] = useState(0);
  const [requests, setRequests] = useState(0);
  const [revision, setRevision] = useState(0);
  const container = useRef<HTMLDivElement>(null);
  const pending = useRef<{
    resolve: () => void;
    reject: (cause: Error) => void;
  } | null>(null);
  const request = () => {
    setRequests((value) => value + 1);
    return new Promise<void>((resolve, reject) => {
      pending.current = { resolve, reject };
    });
  };
  useEffect(() => {
    const suspend = () => setSuspended(true);
    const resolve = () => {
      pending.current?.resolve();
      pending.current = null;
    };
    const reject = () => {
      pending.current?.reject(new Error("Request rejected"));
      pending.current = null;
    };
    window.addEventListener("preview:suspend", suspend);
    window.addEventListener("preview:resolve", resolve);
    window.addEventListener("preview:reject", reject);
    return () => {
      window.removeEventListener("preview:suspend", suspend);
      window.removeEventListener("preview:resolve", resolve);
      window.removeEventListener("preview:reject", reject);
    };
  }, []);
  return (
    <div className="p-4">
      <p className="mb-4 text-sm text-muted">
        Suspend with the preview:suspend event while a native overlay is open.
        Requests wait for preview:resolve or preview:reject.
      </p>
      <p data-testid="requests">Requests: {requests}</p>
      <p data-testid="revision">Revision: {revision}</p>
      {suspended && (
        <div data-testid="resume-screen" className="grid gap-3 py-4">
          <h1>Resume your work</h1>
          <Button onPress={() => setSuspended(false)}>
            Resume same account
          </Button>
          <Button
            variant="secondary"
            onPress={() => {
              setOwner((value) => value + 1);
              setSuspended(false);
            }}
          >
            Switch account
          </Button>
        </div>
      )}
      <OverlaySuspensionScope isSuspended={suspended} key={owner}>
        <div
          ref={container}
          hidden={suspended}
          inert={suspended}
          aria-hidden={suspended}
        >
          <UNSAFE_PortalProvider getContainer={() => container.current}>
            <SuspensionContent
              kind={kind}
              request={request}
              rerenderOnClose={rerenderOnClose}
              moveFocusOnClose={moveFocusOnClose}
              rerender={() => setRevision((value) => value + 1)}
            />
          </UNSAFE_PortalProvider>
        </div>
      </OverlaySuspensionScope>
    </div>
  );
}

function SuspensionContent({
  kind,
  request,
  rerenderOnClose,
  moveFocusOnClose,
  rerender,
}: {
  kind: Kind | ClipboardKind;
  request: () => Promise<void>;
  rerenderOnClose: boolean;
  moveFocusOnClose: boolean;
  rerender: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const destination = useRef<HTMLButtonElement>(null);
  if (kind === "preferences") return <PreferencesSettingsPreview />;
  if (kind === "code")
    return (
      <CodeBlock>
        <CodeBlock.Header>
          <CodeBlock.Filename>Preview code</CodeBlock.Filename>
          <CodeBlock.CopyButton code="Plain text" />
        </CodeBlock.Header>
        <CodeBlock.Code code="Plain text" />
      </CodeBlock>
    );
  if (kind === "key")
    return (
      <>
        <Button onPress={() => setOpen(true)}>Create key</Button>
        <CreateApiKeyDialog
          isOpen={open}
          onOpenChange={setOpen}
          ceilings={["viewer", "member"]}
          expiryOptions={[{ id: "never", label: "Never" }]}
          onCreate={async () => {
            await request();
            return { key: "preview-key" };
          }}
        />
      </>
    );
  if (kind === "confirmation")
    return (
      <>
        <Button onPress={() => setOpen(true)}>Revoke access</Button>
        <ActionConfirmation
          isOpen={open}
          onOpenChange={setOpen}
          title="Revoke access?"
          confirmLabel="Revoke"
          onConfirm={request}
        />
      </>
    );
  if (kind === "dropdown")
    return (
      <Dropdown>
        <Dropdown.Trigger>Open dropdown</Dropdown.Trigger>
        <Dropdown.Popover>
          <Dropdown.Menu aria-label="Actions">
            <Dropdown.Item id="first">First action</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    );
  if (kind === "popover")
    return (
      <Popover>
        <Popover.Trigger>Open popover</Popover.Trigger>
        <Popover.Content>
          <Popover.Dialog>
            <Popover.Heading>Popover content</Popover.Heading>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    );
  const Overlay = kind === "alert" ? AlertDialog : Modal;
  return (
    <>
      <Button ref={destination} variant="secondary">
        Destination focus
      </Button>
      <Overlay
        defaultOpen={false}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next && rerenderOnClose) queueMicrotask(rerender);
          if (!next && moveFocusOnClose)
            requestAnimationFrame(() => destination.current?.focus());
        }}
      >
        <Button>Open overlay</Button>
        <Overlay.Backdrop>
          <Overlay.Container size="sm">
            <Overlay.Dialog>
              <Overlay.Header>
                <Overlay.Heading>Native overlay</Overlay.Heading>
                <Overlay.CloseTrigger />
              </Overlay.Header>
              <Overlay.Body>
                <label>
                  Name
                  <input
                    value={name}
                    onChange={(event) => setName(event.currentTarget.value)}
                  />
                </label>
              </Overlay.Body>
            </Overlay.Dialog>
          </Overlay.Container>
        </Overlay.Backdrop>
        <span data-testid="logical-open">Open: {String(open)}</span>
      </Overlay>
    </>
  );
}

const meta = {
  title: "Primitives/Overlays/OverlaySuspensionScope",
  component: OverlaySuspensionScope,
  parameters: {
    docs: {
      description: {
        component:
          "Use the published OverlaySuspensionScope component from @avgeek-oss/design-system/overlays/overlay-suspension. The examples use the actual export with local sample data and callbacks; applications own routing, permissions and persistence.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <SuspensionPreview kind="key" />,
};

export const ApiKey: Story = {
  name: "ApiKey",
  render: () => <SuspensionPreview kind="key" />,
};

export const Confirmation: Story = {
  name: "Confirmation",
  render: () => <SuspensionPreview kind="confirmation" />,
};

export const ModalExample: Story = {
  name: "Modal",
  render: () => <SuspensionPreview kind="modal" />,
};

export const AlertDialogExample: Story = {
  name: "AlertDialog",
  render: () => <SuspensionPreview kind="alert" />,
};

export const DropdownExample: Story = {
  name: "Dropdown",
  render: () => <SuspensionPreview kind="dropdown" />,
};

export const PopoverExample: Story = {
  name: "Popover",
  render: () => <SuspensionPreview kind="popover" />,
};

export const CodeBlockExample: Story = {
  name: "CodeBlock",
  render: () => <SuspensionPreview kind="code" />,
};

export const Preferences: Story = {
  name: "Preferences",
  render: () => <SuspensionPreview kind="preferences" />,
};

export const AlertRerender: Story = {
  name: "AlertRerender",
  render: () => <SuspensionPreview kind="alert" rerenderOnClose />,
};

export const AlertDestination: Story = {
  name: "AlertDestination",
  render: () => <SuspensionPreview kind="alert" moveFocusOnClose />,
};
