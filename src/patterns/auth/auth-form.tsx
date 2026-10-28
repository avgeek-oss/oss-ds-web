"use client";

import {
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Button } from "../../buttons/button.js";
import { Field, FieldDescription } from "../../forms/field.js";
import { Input } from "../../forms/input.js";
import { Label } from "../../forms/label.js";
import { PasswordInput } from "../../forms/password-input.js";
import { cn } from "../../lib/utils.js";
import { toast } from "../../overlays/toast.js";
import { useOverlaySuspension } from "../../overlays/overlay-suspension.js";

export type AuthField = Omit<
  ComponentProps<typeof Input>,
  "id" | "variant" | "children" | "name"
> & {
  name: string;
  label: string;
  description?: string;
  labelAction?: ReactNode;
};

export function AuthForm({
  fields,
  onSubmit,
  submitLabel,
  busyLabel = "Please wait…",
  variant = "primary",
  children,
  onCancel,
  cancelLabel = "Cancel",
  submitButtonClassName,
  isPending = false,
}: {
  fields: AuthField[];
  onSubmit: (values: Record<string, string>) => Promise<void>;
  submitLabel: string;
  busyLabel?: string;
  variant?: "primary" | "secondary";
  children?: ReactNode;
  onCancel?: () => void;
  cancelLabel?: string;
  submitButtonClassName?: string;
  isPending?: boolean;
}) {
  const id = useId();
  const [isSubmitting, setBusy] = useState(false);
  const busy = isSubmitting || isPending;
  const pending = useRef(false);
  const [invalid, setInvalid] = useState<string[]>([]);
  const suspension = useOverlaySuspension();
  return (
    <form
      className="content-grid"
      method="post"
      noValidate
      aria-busy={busy}
      onSubmit={async (event) => {
        event.preventDefault();
        if (pending.current || isPending || suspension.isSuspended) return;
        const isCurrent = suspension.capture();
        const form = event.currentTarget;
        const inputs = Array.from(form.elements).filter(
          (item): item is HTMLInputElement =>
            item instanceof HTMLInputElement && !item.disabled,
        );
        const errors = inputs.filter((input) => !input.validity.valid);
        setInvalid(errors.map((input) => input.name));
        if (errors.length) {
          const first = errors[0]!;
          const label =
            fields.find((field) => field.name === first.name)?.label ??
            first.name;
          toast.danger(`${label}: ${first.validationMessage}`);
          first.focus();
          return;
        }
        const data = new FormData(form);
        pending.current = true;
        setBusy(true);
        try {
          await onSubmit(
            Object.fromEntries(
              fields
                .filter((field) => !field.disabled)
                .map((field) => {
                  const value = data.get(field.name);
                  return [field.name, typeof value === "string" ? value : ""];
                }),
            ),
          );
        } catch (cause) {
          if (isCurrent())
            toast.danger(
              cause instanceof Error
                ? cause.message
                : "Unable to continue. Try again.",
            );
        } finally {
          pending.current = false;
          setBusy(false);
        }
      }}
    >
      {fields.map(({ label, description, labelAction, type, ...field }) => (
        <Field key={field.name}>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor={`${id}-${field.name}`} isRequired={field.required}>
              {label}
            </Label>
            {labelAction}
          </div>
          {type === "password" ? (
            <PasswordInput
              {...field}
              id={`${id}-${field.name}`}
              variant={variant}
              disabled={field.disabled || busy}
              aria-invalid={invalid.includes(field.name)}
              aria-describedby={
                description ? `${id}-${field.name}-help` : undefined
              }
              onChange={(event) => {
                field.onChange?.(event);
                if (event.currentTarget.validity.valid)
                  setInvalid((current) =>
                    current.filter((name) => name !== field.name),
                  );
              }}
            />
          ) : (
            <Input
              {...field}
              type={type}
              id={`${id}-${field.name}`}
              variant={variant}
              disabled={field.disabled || busy}
              aria-invalid={invalid.includes(field.name)}
              aria-describedby={
                description ? `${id}-${field.name}-help` : undefined
              }
              onChange={(event) => {
                field.onChange?.(event);
                if (event.currentTarget.validity.valid)
                  setInvalid((current) =>
                    current.filter((name) => name !== field.name),
                  );
              }}
            />
          )}
          {description ? (
            <FieldDescription id={`${id}-${field.name}-help`}>
              {description}
            </FieldDescription>
          ) : null}
        </Field>
      ))}
      {children}
      <div className={onCancel ? "flex flex-wrap justify-end gap-2" : "flex"}>
        {onCancel ? (
          <Button variant="secondary" isDisabled={busy} onPress={onCancel}>
            {cancelLabel}
          </Button>
        ) : null}
        <Button
          type="submit"
          className={cn(onCancel ? undefined : "w-full", submitButtonClassName)}
          isDisabled={busy}
        >
          {busy ? busyLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
