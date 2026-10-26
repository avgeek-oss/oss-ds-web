// @dsCard group="Data display" height=448
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ display: "grid", gap: 16, padding: 16, maxWidth: 560 }}>
    <A.Attributes title="Aircraft">
      <A.Attributes.Item label="Registration">N172AV</A.Attributes.Item>
      <A.Attributes.Item label="Type">Cessna 172S</A.Attributes.Item>
      <A.Attributes.Item label="Base">KPAO</A.Attributes.Item>
      <A.Attributes.Item label="Hours">4,812</A.Attributes.Item>
    </A.Attributes>
    <A.Attributes variant="card" title="Maintenance" columns={1}>
      <A.Attributes.Item label="Last inspection">12 Sep 2026</A.Attributes.Item>
      <A.Attributes.Item label="Next due">12 Sep 2027</A.Attributes.Item>
    </A.Attributes>
  </div>,
);
