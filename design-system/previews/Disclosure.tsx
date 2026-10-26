// @dsCard group="Navigation" height=136
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ padding: 16, maxWidth: 420 }}>
    <A.Disclosure defaultExpanded>
      <A.Disclosure.Heading>
        <A.Disclosure.Trigger>
          Advanced options
          <A.Disclosure.Indicator />
        </A.Disclosure.Trigger>
      </A.Disclosure.Heading>
      <A.Disclosure.Content>
        <A.Disclosure.Body>
          Retries, timeouts and the regions this check runs from. Defaults suit
          most services.
        </A.Disclosure.Body>
      </A.Disclosure.Content>
    </A.Disclosure>
  </div>,
);
