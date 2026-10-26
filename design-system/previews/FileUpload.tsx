// @dsCard group="Forms" height=288
import * as A from "../namespace.js";
import { mount } from "./mount.js";
const upload = () => new Promise<void>((resolve) => setTimeout(resolve, 1200));
mount(
  <div style={{ padding: 16, display: "grid", gap: 16, maxWidth: 512 }}>
    <A.FileUpload
      accept="image/png,image/jpeg,application/pdf"
      maxSizeBytes={5 * 1024 * 1024}
      description="PNG, JPEG or PDF, up to 5 MB. Choose a file or drop it here."
      onUpload={upload}
    />
    <A.FileUpload
      isDisabled
      description="You need edit access to add attachments."
      onUpload={upload}
    />
  </div>,
);
