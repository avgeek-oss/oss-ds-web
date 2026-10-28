"use client";

import { useEffect, useId } from "react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../../buttons/button.js";
import { Field, FieldError, FieldGroup } from "../../forms/field.js";
import { Input } from "../../forms/input.js";
import { PasswordInput } from "../../forms/password-input.js";
import { Label } from "../../forms/label.js";
import { toast } from "../../overlays/toast.js";
import type { ComponentRootProps } from "../../lib/component-root-props.js";
import { cn } from "../../lib/utils.js";

import type { ReactNode } from "react";

const credentialsSchema = z.object({
  identifier: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type IdentityCredentials = z.infer<typeof credentialsSchema>;

type IdentityCredentialsFormOwnProps = {
  children?: never;
  defaultIdentifier?: string;
  disabled?: boolean;
  /** Field validation presentation. Submission failures always use toasts. */
  errorPresentation?: "inline" | "toast";
  identifier?: string;
  identifierAutoComplete?: string;
  identifierLabel?: string;
  identifierPlaceholder?: string;
  identifierType?: "email" | "text";
  onIdentifierChange?: (identifier: string) => void;
  onSubmit: (credentials: IdentityCredentials) => Promise<void>;
  passwordAction?: ReactNode;
  submitLabel?: string;
  submitIcon?: ReactNode;
  submittingLabel?: string;
};

type IdentityCredentialsFormProps = Omit<
  ComponentRootProps<"form", IdentityCredentialsFormOwnProps>,
  "method"
>;

export function IdentityCredentialsForm({
  className,
  defaultIdentifier = "",
  disabled = false,
  errorPresentation = "toast",
  identifier,
  identifierAutoComplete = "username",
  identifierLabel = "Username",
  identifierPlaceholder,
  identifierType = "text",
  onIdentifierChange,
  onSubmit,
  passwordAction,
  submitLabel = "Sign in",
  submitIcon,
  submittingLabel = "Signing in…",
  ...props
}: IdentityCredentialsFormProps) {
  const identifierId = useId();
  const passwordId = useId();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<IdentityCredentials>({
    defaultValues: {
      identifier: identifier ?? defaultIdentifier,
      password: "",
    },
    mode: "onTouched",
    resolver: standardSchemaResolver(
      credentialsSchema.extend({
        identifier: z.string().trim().min(1, `${identifierLabel} is required`),
      }),
    ),
  });
  // oxlint-disable-next-line react/incompatible-library -- the app does not use React Compiler; watch() keeps the identifier current
  const currentIdentifier = watch("identifier");
  const identifierField = register("identifier");

  useEffect(() => {
    if (identifier === undefined || identifier === currentIdentifier) return;
    setValue("identifier", identifier);
  }, [currentIdentifier, identifier, setValue]);

  useEffect(() => {
    const clearPassword = () => setValue("password", "");
    window.addEventListener("pagehide", clearPassword);
    return () => {
      window.removeEventListener("pagehide", clearPassword);
      clearPassword();
    };
  }, [setValue]);

  const submit = handleSubmit(
    async (credentials) => {
      if (disabled) return;
      if (
        identifierType === "email" &&
        !z.email().safeParse(credentials.identifier).success
      ) {
        setError("identifier", { message: "Enter a valid email address" });
        if (errorPresentation === "toast")
          toast.danger("Enter a valid email address");
        return;
      }
      try {
        await onSubmit(credentials);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Sign in failed";
        toast.danger(message);
      } finally {
        setValue("password", "");
      }
    },
    (errors) => {
      if (errorPresentation === "toast")
        toast.danger(
          errors.identifier?.message ??
            errors.password?.message ??
            "Check the required fields",
        );
    },
  );

  return (
    <form
      className={cn("grid gap-5", className)}
      {...props}
      noValidate
      method="post"
      onSubmit={submit}
    >
      <FieldGroup>
        <Field>
          <Label htmlFor={identifierId} isRequired>
            {identifierLabel}
          </Label>
          <Input
            id={identifierId}
            disabled={disabled || isSubmitting}
            type={identifierType}
            autoComplete={identifierAutoComplete}
            aria-invalid={Boolean(errors.identifier)}
            placeholder={identifierPlaceholder}
            required
            {...identifierField}
            onChange={(event) => {
              void identifierField.onChange(event);
              onIdentifierChange?.(event.target.value);
            }}
          />
          {errorPresentation === "inline" && errors.identifier && (
            <FieldError>{errors.identifier.message}</FieldError>
          )}
        </Field>
        <Field>
          <div className="flex items-center justify-between">
            <Label htmlFor={passwordId} isRequired>
              Password
            </Label>
            {passwordAction}
          </div>
          <PasswordInput
            id={passwordId}
            disabled={disabled || isSubmitting}
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            required
            {...register("password")}
          />
          {errorPresentation === "inline" && errors.password && (
            <FieldError>{errors.password.message}</FieldError>
          )}
        </Field>
      </FieldGroup>
      <Button
        type="submit"
        isDisabled={disabled || isSubmitting}
        className="w-full"
      >
        {submitIcon}
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </form>
  );
}
