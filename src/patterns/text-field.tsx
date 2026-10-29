"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { Input } from "../forms/input.js";
import { Textarea } from "../forms/textarea.js";
import { Label } from "../forms/label.js";
import { Field, FieldDescription } from "../forms/field.js";

type TextFieldDetails = {
  label: string;
  /** Help text below the control, linked through `aria-describedby`. */
  description?: ReactNode;
  /** Keeps the label for assistive technology but hides it visually. */
  hideLabel?: boolean;
};
export type TextFieldProps = TextFieldDetails &
  (
    | (Omit<ComponentProps<typeof Input>, "children"> & { multiline?: false })
    | (Omit<ComponentProps<typeof Textarea>, "children"> & { multiline: true })
  );

/**
 * A labelled native text input, or a textarea with `multiline`, on the
 * secondary surface. Input props pass through to the native control.
 */
export function TextField({
  label,
  description,
  hideLabel = false,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const descriptionId = `${id}-description`;
  const describedBy =
    [props["aria-describedby"], description ? descriptionId : null]
      .filter(Boolean)
      .join(" ") || undefined;
  let control: ReactNode;
  if (props.multiline) {
    const { multiline: _multiline, ...textareaProps } = props;
    control = (
      <Textarea
        {...textareaProps}
        variant={textareaProps.variant ?? "secondary"}
        id={id}
        aria-describedby={describedBy}
      />
    );
  } else {
    const { multiline: _multiline, ...inputProps } = props;
    control = (
      <Input
        {...inputProps}
        variant={inputProps.variant ?? "secondary"}
        id={id}
        aria-describedby={describedBy}
      />
    );
  }
  return (
    <Field>
      <Label
        htmlFor={id}
        isRequired={props.required}
        className={hideLabel ? "sr-only" : undefined}
      >
        {label}
      </Label>
      {control}
      {description ? (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      ) : null}
    </Field>
  );
}
