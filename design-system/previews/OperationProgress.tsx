// @dsCard group="Data patterns" height=432
import * as A from "../namespace.js";
import { mount } from "./mount.js";
mount(
  <div style={{ padding: 16 }}>
    <A.OperationProgress
      steps={[
        {
          id: "checkout",
          title: "Check out repository",
          description: "Completed in 2 seconds",
          status: "succeeded",
        },
        {
          id: "build",
          title: "Build application",
          description: "The build command failed.",
          status: "failed",
        },
        {
          id: "health",
          title: "Health checks",
          description: "Checking the application endpoint…",
          status: "running",
        },
        {
          id: "deploy",
          title: "Start application",
          description: "Waiting for the build to finish.",
          status: "waiting",
        },
        {
          id: "cleanup",
          title: "Cleanup",
          description: "No cleanup required",
          status: "skipped",
        },
        {
          id: "cancelled",
          title: "Previous operation",
          description: "Cancelled by the user",
          status: "cancelled",
        },
      ]}
    />
  </div>,
);
