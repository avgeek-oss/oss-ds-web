"use client";

import { useEffect, useRef } from "react";
import { Button } from "../../buttons/button.js";
import { CodeBlock } from "../../typography/code-block.js";

/** A new key's secret, shown once, with a Done action that takes focus. */
export function ApiKeySecret({
  secret,
  onDone,
}: {
  secret: string;
  onDone: () => void;
}) {
  const doneRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    doneRef.current?.focus();
  }, []);
  return (
    <div className="grid gap-4">
      <p>
        Save this key in a secret manager. You won&apos;t be able to see it
        again.
      </p>
      <CodeBlock>
        <CodeBlock.Header>
          <CodeBlock.Filename>Your new key</CodeBlock.Filename>
          <CodeBlock.CopyButton code={secret} />
        </CodeBlock.Header>
        <CodeBlock.Code code={secret} />
      </CodeBlock>
      <Button ref={doneRef} onPress={onDone}>
        Done
      </Button>
    </div>
  );
}
