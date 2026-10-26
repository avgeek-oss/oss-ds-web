// @dsCard group="Navigation" height=144
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ padding: 16, maxWidth: 560 }}>
    <A.Tabs defaultSelectedKey="overview">
      <A.Tabs.ListContainer>
        <A.Tabs.List aria-label="Service sections">
          <A.Tabs.Tab id="overview">
            Overview
            <A.Tabs.Indicator />
          </A.Tabs.Tab>
          <A.Tabs.Tab id="deployments">
            Deployments
            <A.Tabs.Indicator />
          </A.Tabs.Tab>
          <A.Tabs.Tab id="logs">
            Logs
            <A.Tabs.Indicator />
          </A.Tabs.Tab>
          <A.Tabs.Tab id="billing" isDisabled>
            Billing
          </A.Tabs.Tab>
        </A.Tabs.List>
      </A.Tabs.ListContainer>
      <A.Tabs.Panel id="overview">
        <p style={{ fontSize: 14, margin: "12px 0 0" }}>
          Health, traffic and the latest release for this service.
        </p>
      </A.Tabs.Panel>
      <A.Tabs.Panel id="deployments">
        <p style={{ fontSize: 14, margin: "12px 0 0" }}>
          Every release, newest first.
        </p>
      </A.Tabs.Panel>
      <A.Tabs.Panel id="logs">
        <p style={{ fontSize: 14, margin: "12px 0 0" }}>
          Streaming logs from all instances.
        </p>
      </A.Tabs.Panel>
    </A.Tabs>
  </div>,
);
