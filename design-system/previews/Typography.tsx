// @dsCard group="Typography" height=408
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ display: "grid", gap: 20, padding: 16 }}>
    <div style={{ display: "grid", gap: 8 }}>
      {([1, 2, 3, 4, 5, 6] as const).map((level) => (
        <A.TypographyHeading key={level} level={level}>
          Heading {level} · Fleet overview
        </A.TypographyHeading>
      ))}
    </div>
    <div style={{ display: "grid", gap: 6 }}>
      <A.TypographyParagraph size="lg">
        Large paragraph for lead copy.
      </A.TypographyParagraph>
      <A.TypographyParagraph>
        Default paragraph for body copy on surfaces and pages.
      </A.TypographyParagraph>
      <A.TypographyParagraph size="sm" color="muted">
        Small muted paragraph for supporting detail.
      </A.TypographyParagraph>
    </div>
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        gap: 16,
      }}
    >
      <A.TypographyText textRole="label">Label</A.TypographyText>
      <A.TypographyText textRole="supporting">Supporting</A.TypographyText>
      <A.TypographyText textRole="caption">
        Caption · 11:40 UTC
      </A.TypographyText>
      <A.TypographyCode>pnpm add @avgeek-oss/design-system</A.TypographyCode>
    </div>
  </div>,
);
