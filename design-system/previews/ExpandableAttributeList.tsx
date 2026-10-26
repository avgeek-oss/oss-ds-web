// @dsCard group="Data display" height=288
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ padding: 16, maxWidth: 640 }}>
    <A.ExpandableAttributeList title="Activity">
      <A.ExpandableAttributeList.Item
        label="Status"
        value="Ready"
        leadingContent="11:40"
      />
      <A.ExpandableAttributeList.Item
        label="Weather report"
        value="Complete"
        leadingContent="10:49"
        defaultExpanded
      >
        <A.Attributes variant="embedded" columns={1}>
          <A.Attributes.Item label="Source">METAR KSFO</A.Attributes.Item>
          <A.Attributes.Item label="Records">240</A.Attributes.Item>
        </A.Attributes>
      </A.ExpandableAttributeList.Item>
      <A.ExpandableAttributeList.Item
        label="Status"
        value="Queued"
        leadingContent="09:57"
      />
    </A.ExpandableAttributeList>
  </div>,
);
