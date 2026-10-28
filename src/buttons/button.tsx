"use client";

import { type Button as HeroButton, Link as HeroLink } from "@heroui/react";
import { buttonVariants as heroButtonVariants } from "@heroui/styles";
import { cn } from "../lib/utils.js";
import type { ComponentProps } from "react";

export { Button, buttonVariants } from "@heroui/react";
export type { ButtonProps } from "@heroui/react";
export type ButtonVariant = NonNullable<
  ComponentProps<typeof HeroButton>["variant"]
>;

export type ButtonLinkProps = Omit<
  ComponentProps<typeof HeroLink>,
  "className"
> & {
  className?: string;
  size?: ComponentProps<typeof HeroButton>["size"];
  variant?: ButtonVariant;
};

export function ButtonLink({
  className,
  style,
  size,
  variant,
  ...props
}: ButtonLinkProps) {
  return (
    <HeroLink
      className={cn(
        heroButtonVariants({
          className,
          size,
          variant,
        }),
        "inline-flex items-center gap-2",
      )}
      style={
        typeof style === "function"
          ? (values) => ({ color: "var(--button-fg)", ...style(values) })
          : { color: "var(--button-fg)", ...style }
      }
      {...props}
    />
  );
}
