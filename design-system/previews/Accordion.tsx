// @dsCard group="Data display" height=312
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const items = [
  [
    "Who can create API keys?",
    "Admins and members can create keys. Viewers can see keys but not create them.",
  ],
  [
    "How long do sessions last?",
    "Sessions stay active for 30 days unless revoked.",
  ],
];
const list = (variant: "default" | "surface") => (
  <A.Accordion
    variant={variant}
    defaultExpandedKeys={variant === "surface" ? ["0"] : []}
  >
    {items.map(([title, body], i) => (
      <A.Accordion.Item key={i} id={String(i)}>
        <A.Accordion.Heading>
          <A.Accordion.Trigger>
            {title}
            <A.Accordion.Indicator />
          </A.Accordion.Trigger>
        </A.Accordion.Heading>
        <A.Accordion.Panel>
          <A.Accordion.Body>{body}</A.Accordion.Body>
        </A.Accordion.Panel>
      </A.Accordion.Item>
    ))}
  </A.Accordion>
);
mount(
  <div style={{ display: "grid", gap: 16, padding: 16, maxWidth: 560 }}>
    {list("default")}
    {list("surface")}
  </div>,
);
