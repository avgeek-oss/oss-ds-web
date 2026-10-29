import { useState } from "react";
import { usePreviewOptions } from "./preview-options";
import { ProfileSettings } from "../src/patterns/account-settings/profile-settings";
import { PreferencesSettings } from "../src/patterns/account-settings/preferences-settings";
import { SessionsSettings } from "../src/patterns/account-settings/sessions-settings";
import type { DateTimePreferences } from "../src/patterns/settings/date-time-preference-fields";
import type { Session } from "../src/patterns/settings/tables";
import { preferenceOptions } from "./preference-options";
import { availableTimeZones } from "../src/utilities/date-time-preferences";

const created = "2026-10-06T00:00:00Z";
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
function useSettingsRequest() {
  const { failRequest: fail, slowResponse: slow } = usePreviewOptions();
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, slow ? 2000 : 800));
    if (fail)
      throw new Error(
        "Could not save changes. Your draft is retained. Try again.",
      );
  };
}
export function ProfileSettingsPreview() {
  return (
    <div className="max-w-lg p-4">
      <ProfileSettings
        name="Alex Taylor"
        email="alex@example.test"
        role="member"
        providerName="authentik"
        manageUrl="https://auth.example.test/if/user/"
      />
    </div>
  );
}
export function PreferencesSettingsPreview({
  embedded = false,
  allTimeZones = false,
}: {
  embedded?: boolean;
  allTimeZones?: boolean;
}) {
  const [value, setValue] = useState<DateTimePreferences>({
    dateFormat: "day-short-month-year",
    timeFormat: "24-hour",
    timeZone: "UTC",
  });
  const request = useSettingsRequest();
  const content = (
    <PreferencesSettings
      value={value}
      options={
        allTimeZones
          ? {
              ...preferenceOptions,
              timeZones: availableTimeZones(),
            }
          : preferenceOptions
      }
      onSave={async (preferences) => {
        await request();
        setValue(preferences);
      }}
    />
  );
  return embedded ? content : <div className="max-w-lg p-4">{content}</div>;
}
export function SessionsSettingsPreview({
  everywhere = true,
}: {
  everywhere?: boolean;
}) {
  const [items, setItems] = useState<Session[]>([
    {
      id: "session-current",
      name: "Safari on macOS",
      detail: "London",
      signedInAt: created,
      lastActive: created,
      expiresAt: "2026-10-13T00:00:00Z",
      current: true,
    },
    {
      id: "session-other",
      name: "Chrome on Windows",
      detail: "Manchester",
      signedInAt: created,
      lastActive: created,
      expiresAt: "2026-10-13T00:00:00Z",
      current: false,
    },
  ]);
  const request = useSettingsRequest();
  return (
    <div className="p-4">
      <SessionsSettings
        items={items}
        formatDate={formatDate}
        onSignOutCurrent={async () => {
          await request();
          setItems([]);
        }}
        onSignOut={async (id) => {
          await request();
          setItems((current) => current.filter((item) => item.id !== id));
        }}
        onSignOutEverywhere={
          everywhere
            ? async () => {
                await request();
                setItems([]);
              }
            : undefined
        }
      />
    </div>
  );
}
