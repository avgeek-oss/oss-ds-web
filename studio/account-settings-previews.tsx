import { useState } from "react";
import { usePreviewOptions } from "./preview-options";
import { ProfileSettings } from "../src/patterns/account-settings/profile-settings";
import { PreferencesSettings } from "../src/patterns/account-settings/preferences-settings";
import { PasskeySettings } from "../src/patterns/account-settings/passkey-settings";
import { SessionsSettings } from "../src/patterns/account-settings/sessions-settings";
import type { DateTimePreferences } from "../src/patterns/settings/date-time-preference-fields";
import type { Passkey, Session } from "../src/patterns/settings/tables";
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
  const [name, setName] = useState("Alex");
  const request = useSettingsRequest();
  return (
    <div className="max-w-lg p-4">
      <ProfileSettings
        value={name}
        email="alex@example.test"
        onSave={async (value) => {
          await request();
          setName(value);
        }}
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
const previewCodes = [
  "demo-0001-preview",
  "demo-0002-preview",
  "demo-0003-preview",
  "demo-0004-preview",
];
export function PasskeySettingsPreview({
  empty = false,
  management = true,
}: {
  empty?: boolean;
  management?: boolean;
}) {
  const [items, setItems] = useState<Passkey[]>(
    empty ? [] : [{ id: "key-1", name: "Security key", createdAt: created }],
  );
  const [codes, setCodes] = useState<readonly string[]>([]);
  const request = useSettingsRequest();
  return (
    <div className="p-4">
      <PasskeySettings
        items={items}
        formatDate={formatDate}
        onAdd={async (name) => {
          await request();
          if (!items.length) setCodes(previewCodes);
          setItems((current) => [
            ...current,
            { id: `key-${Date.now()}`, name, createdAt: created },
          ]);
        }}
        onRename={
          management
            ? async (id, name) => {
                await request();
                setItems((current) =>
                  current.map((item) =>
                    item.id === id ? { ...item, name } : item,
                  ),
                );
              }
            : undefined
        }
        onRemove={async (id) => {
          await request();
          setItems((current) => current.filter((item) => item.id !== id));
        }}
        onReplaceRecoveryCodes={
          management
            ? async () => {
                await request();
                setCodes(previewCodes);
              }
            : undefined
        }
        recoveryCodes={codes}
        onDismissRecoveryCodes={() => setCodes([])}
      />
    </div>
  );
}
export function SessionsSettingsPreview() {
  const [items, setItems] = useState<Session[]>([
    {
      id: "session-current",
      name: "Safari on macOS",
      lastActive: created,
      expiresAt: "2026-10-13T00:00:00Z",
      current: true,
    },
    {
      id: "session-other",
      name: "Chrome on Windows",
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
        onRevoke={async (id) => {
          await request();
          setItems((current) => current.filter((item) => item.id !== id));
        }}
      />
    </div>
  );
}
