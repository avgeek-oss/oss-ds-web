import type { Meta, StoryObj } from "@storybook/react-vite";
import { PrimitivePreview, Variant } from "../../../studio/primitive-preview";
import {
  RelativeTime,
  type RelativeTimeDisplay,
} from "../../../src/data-display/relative-time";

const formatAbsolute = (value: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(value);
// Sample times relative to when the story loads.
const loadedAt = Date.now();
const minutesAgo = (minutes: number) =>
  new Date(loadedAt - minutes * 60_000).toISOString();

function RelativeTimeExample({
  display,
  value = minutesAgo(5),
  label = "Last synced",
}: {
  display: RelativeTimeDisplay;
  value?: string | null;
  label?: string;
}) {
  return (
    <RelativeTime
      value={value}
      label={label}
      display={display}
      formatAbsolute={formatAbsolute}
      timeZone="Europe/London"
    />
  );
}

function RelativeTimeVariants({ section = 0 }: { section?: number }) {
  return (
    <PrimitivePreview title="RelativeTime">
      {section === 0 && (
        <Variant title="Stacked">
          <RelativeTimeExample display="stacked" />
          <RelativeTimeExample
            display="stacked"
            label="Created"
            value={minutesAgo(60 * 24 * 3)}
          />
        </Variant>
      )}
      {section === 1 && (
        <Variant title="Relative">
          <RelativeTimeExample display="relative" />
          <RelativeTimeExample
            display="relative"
            label="Expires"
            value={minutesAgo(-3 * 24 * 60)}
          />
        </Variant>
      )}
      {section === 2 && (
        <Variant title="Compact">
          <RelativeTimeExample display="compact" label="Last published" />
        </Variant>
      )}
      {section === 3 && (
        <Variant title="Absolute">
          <RelativeTimeExample display="absolute" label="Scheduled for" />
        </Variant>
      )}
      {section === 4 && (
        <Variant title="Unavailable">
          <RelativeTimeExample display="stacked" value={null} />
        </Variant>
      )}
    </PrimitivePreview>
  );
}

const meta = {
  title: "Primitives/DataDisplay/RelativeTime",
  component: RelativeTime,
  parameters: {
    docs: {
      description: {
        component:
          "Use RelativeTime from @avgeek-oss/design-system/data-display/relative-time. Applications pass formatAbsolute and timeZone from the viewer's date and time preferences.",
      },
    },
  },
} satisfies Meta<typeof RelativeTime>;
export default meta;
type Story = StoryObj;

export const Master: Story = {
  name: "Master",
  render: () => <RelativeTimeVariants section={0} />,
};
export const Relative: Story = {
  name: "Relative",
  render: () => <RelativeTimeVariants section={1} />,
};
export const Compact: Story = {
  name: "Compact",
  render: () => <RelativeTimeVariants section={2} />,
};
export const Absolute: Story = {
  name: "Absolute",
  render: () => <RelativeTimeVariants section={3} />,
};
export const Unavailable: Story = {
  name: "Unavailable",
  render: () => <RelativeTimeVariants section={4} />,
};
