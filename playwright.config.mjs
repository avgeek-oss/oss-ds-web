import { defineConfig } from "@playwright/test";

const projects = [];
for (const width of [390, 1280]) {
  for (const theme of ["light", "dark"]) {
    for (const reducedMotion of ["no-preference", "reduce"]) {
      projects.push({
        name: `${width}-${theme}-${reducedMotion}`,
        ...(reducedMotion === "reduce"
          ? { testMatch: /(?:navigation|feedback)\.spec\.mjs/ }
          : {}),
        use: {
          viewport: { width, height: 900 },
          hasTouch: width === 390,
          colorScheme: theme,
          reducedMotion,
        },
      });
    }
  }
}

export default defineConfig({
  testDir: "test/browser",
  testMatch: "**/*.spec.mjs",
  // Two workers, measured on the 4-vCPU GitHub runner in run 40488203862:
  // the full suite passed 3 of 3 times at 2 workers (447-580 s) and at 1
  // worker took 911 s. At 4 workers 2 of 3 runs failed: no toBeFocused
  // assertion failed, but keyboard paths did (Enter on a focused Revoke
  // button opened no dialog three times, focus did not move into a dialog
  // once) and one Ctrl+click new-tab wait timed out. Raise this only after
  // those keyboard paths pass repeatedly at the higher count.
  workers: 2,
  forbidOnly: true,
  outputDir: "artifacts/browser/results",
  reporter: [
    ["list"],
    ["json", { outputFile: "artifacts/browser/report.json" }],
  ],
  use: {
    browserName: "chromium",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects,
});
