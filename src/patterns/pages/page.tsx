import type { ComponentProps, ReactElement, ReactNode } from "react";
import { AppShellBreadcrumb } from "../../layouts/app-shell-breadcrumb.js";
import type { AppShellBreadcrumbItems } from "../../layouts/application-shell-types.js";
import { Page, PageSection } from "../../layouts/page.js";
import { cn } from "../../lib/utils.js";
import { TooltipText } from "../../overlays/tooltip.js";
import {
  TypographyHeading,
  TypographyParagraph,
} from "../../typography/typography.js";
export type BreadcrumbAncestors = readonly AppShellBreadcrumbItems[number][];
type Shared = Omit<ComponentProps<typeof Page>, "lead">;
export interface ApplicationPageProps extends Shared {
  actions?: ReactNode;
  badge?: ReactNode;
  breadcrumbAncestors: BreadcrumbAncestors;
  breadcrumbContent?: ReactNode;
  breadcrumbContentKey?: string;
  breadcrumbLabel?: string;
  description?: string;
  title: string;
  titleContent?: ReactNode;
  titleDensity?: string;
  titleOverflow?: "wrap" | "truncate";
}
function TitledPage({
  actions,
  badge,
  breadcrumbAncestors: _breadcrumbAncestors,
  breadcrumbContent: _breadcrumbContent,
  breadcrumbContentKey: _breadcrumbContentKey,
  breadcrumbLabel: _breadcrumbLabel,
  children,
  description,
  title,
  titleContent,
  titleDensity: _titleDensity,
  titleOverflow = "wrap",
  ...props
}: ApplicationPageProps) {
  return (
    <Page
      {...props}
      lead={
        <PageSection className="py-4" xPadding="none" yPadding="none">
          <header
            className={cn(
              "flex min-h-8 items-center justify-between gap-5",
              titleOverflow === "wrap" && "flex-wrap",
            )}
          >
            <div
              className={cn(
                "flex min-w-0 items-center gap-3 pl-1 sm:pl-0",
                titleOverflow === "truncate" ? "flex-1" : "flex-wrap",
              )}
            >
              <TypographyHeading
                data-slot="application-page-heading"
                className={cn(
                  "flex min-w-0 items-center text-lg leading-7 font-medium",
                  titleOverflow === "truncate" && "overflow-hidden",
                )}
                elementType="h1"
                level={3}
              >
                {titleContent ??
                  (titleOverflow === "truncate" ? (
                    <TooltipText
                      className="min-w-0 truncate"
                      tooltip={title}
                      openOnPress
                    >
                      {title}
                    </TooltipText>
                  ) : (
                    title
                  ))}
              </TypographyHeading>
              {badge}
            </div>
            {titleOverflow === "truncate" && actions ? (
              <div className="flex shrink-0 items-center gap-2">{actions}</div>
            ) : (
              actions
            )}
          </header>
          {description ? (
            <TypographyParagraph className="mt-2" color="muted">
              {description}
            </TypographyParagraph>
          ) : null}
        </PageSection>
      }
    >
      {children}
    </Page>
  );
}
export function ApplicationPage(props: ApplicationPageProps) {
  const {
    breadcrumbAncestors,
    breadcrumbContent,
    breadcrumbContentKey,
    breadcrumbLabel,
    title,
  } = props;
  const current = {
    content: breadcrumbContent,
    contentKey: breadcrumbContentKey,
    label: breadcrumbLabel ?? title,
  };
  const [firstAncestor, ...otherAncestors] = breadcrumbAncestors;
  const breadcrumbItems: AppShellBreadcrumbItems = firstAncestor
    ? [firstAncestor, ...otherAncestors, current]
    : [current];

  return (
    <>
      <AppShellBreadcrumb items={breadcrumbItems} title={title} />
      <TitledPage {...props} />
    </>
  );
}
export function ContentPage(props: ApplicationPageProps) {
  return <TitledPage {...props} />;
}
export function StatusPage({ children, ...props }: ApplicationPageProps) {
  return <TitledPage {...props}>{children}</TitledPage>;
}
export function AuthPage({
  children,
  className,
  ...props
}: Shared & { children: ReactNode }) {
  return (
    <Page {...props} className={cn("w-full", className)}>
      <PageSection
        data-slot="auth-page-content"
        className="grid min-h-[calc(100dvh-8rem)] place-items-center"
        width="content"
        yPadding="none"
      >
        {children}
      </PageSection>
    </Page>
  );
}
export function MarketingPage({
  children,
  hero,
  ...props
}: Shared & { hero: ReactElement; children: ReactNode }) {
  return (
    <Page
      {...props}
      lead={
        <PageSection width="full" xPadding="none" yPadding="none">
          {hero}
        </PageSection>
      }
    >
      {children}
    </Page>
  );
}
export function HomepageHero({
  actions,
  description,
  eyebrow,
  title,
}: {
  actions?: ReactNode;
  description?: ReactNode;
  eyebrow?: { label: ReactNode };
  title: ReactNode;
}) {
  return (
    <section className="mx-auto grid min-h-[36rem] max-w-7xl content-center gap-6 px-4 py-20 sm:px-6 lg:px-8">
      {eyebrow ? (
        <span className="text-sm font-medium text-muted">{eyebrow.label}</span>
      ) : null}
      <TypographyHeading className="max-w-4xl text-5xl sm:text-6xl" level={1}>
        {title}
      </TypographyHeading>
      {description ? (
        <TypographyParagraph className="max-w-2xl" color="muted" size="lg">
          {description}
        </TypographyParagraph>
      ) : null}
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </section>
  );
}
