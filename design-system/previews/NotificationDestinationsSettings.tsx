// @dsCard group="Account settings" height=208 width=880
import * as React from "react";
import type { ComponentProps } from "react";
import * as A from "../namespace.js";
import { mount } from "./mount.js";
function Destinations() {
  const [items, setItems] = React.useState<
    ComponentProps<typeof A.NotificationDestinationsSettings>["items"]
  >([
    {
      id: "ops",
      label: "#operations",
      description: "Slack channel C12345678",
      subscriptions: { deployments: "all", backups: "all", incidents: "off" },
    },
    {
      id: "alerts",
      label: "#alerts",
      description: "Slack channel C87654321",
      subscriptions: {
        deployments: "failures",
        backups: "off",
        incidents: "all",
      },
    },
  ]);
  return (
    <div style={{ padding: 16 }}>
      <A.NotificationDestinationsSettings
        items={items}
        categories={[
          {
            id: "deployments",
            label: "Deployments",
            modes: ["off", "all", "failures"],
          },
          { id: "backups", label: "Backup & Restore", modes: ["off", "all"] },
          { id: "incidents", label: "Incidents", modes: ["off", "all"] },
        ]}
        onSubscriptionChange={async (row, category, mode) =>
          setItems((current) =>
            current.map((item) =>
              item.id === row.id
                ? {
                    ...item,
                    subscriptions: { ...item.subscriptions, [category]: mode },
                  }
                : item,
            ),
          )
        }
        onTest={async () => {}}
        onRemove={async () => {}}
      />
    </div>
  );
}
mount(<Destinations />);
