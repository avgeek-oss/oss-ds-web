// @dsCard group="Data display" height=144
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const row = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 8,
} as const;
mount(
  <div style={{ display: "grid", gap: 16, padding: 16 }}>
    <div style={row}>
      <A.Chip color="default">Draft</A.Chip>
      <A.Chip color="accent">In review</A.Chip>
      <A.Chip color="success">Active</A.Chip>
      <A.Chip color="warning">Expiring soon</A.Chip>
      <A.Chip color="danger">Revoked</A.Chip>
    </div>
    <div style={row}>
      <A.Chip color="accent" variant="primary">
        Primary
      </A.Chip>
      <A.Chip color="accent" variant="secondary">
        Secondary
      </A.Chip>
      <A.Chip color="accent" variant="soft">
        Soft
      </A.Chip>
      <A.Chip color="accent" variant="tertiary">
        Tertiary
      </A.Chip>
    </div>
    <div style={row}>
      <A.Chip size="sm">Small</A.Chip>
      <A.Chip size="md">Medium</A.Chip>
      <A.Chip size="lg">Large</A.Chip>
      <A.Chip aria-busy>
        <A.Spinner color="current" size="sm" />
        <A.Chip.Label>Deploying</A.Chip.Label>
      </A.Chip>
    </div>
  </div>,
);
