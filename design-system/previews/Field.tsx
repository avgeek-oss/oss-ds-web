// @dsCard group="Forms" height=224
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ padding: 16, display: "grid", gap: 16, maxWidth: 448 }}>
    <A.Field>
      <A.FieldLabel htmlFor="team-name" isRequired>
        Team name
      </A.FieldLabel>
      <A.Input
        id="team-name"
        required
        defaultValue="Avgeek Ops"
        aria-describedby="team-name-description"
      />
      <A.FieldDescription id="team-name-description">
        Up to 120 characters.
      </A.FieldDescription>
    </A.Field>
    <A.Field>
      <A.FieldLabel htmlFor="key-name">Name</A.FieldLabel>
      <A.Input id="key-name" aria-invalid aria-describedby="key-name-error" />
      <A.FieldError id="key-name-error">
        Enter a name for this API key.
      </A.FieldError>
    </A.Field>
  </div>,
);
