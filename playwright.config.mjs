import { defineConfig } from "@playwright/test";

// Reduced motion changes only navigation and feedback transitions. The dark
// theme changes colours, so dark projects run only the specs that read
// computed colours or the theme wiring: feedback (chip tone colours),
// navigation (breadcrumb emphasis colours) and storybook (the docs theme
// global). Every other spec checks behaviour that no theme token affects.
const reducedMotionSpecs = /(?:navigation|feedback)\.spec\.mjs/;
const darkThemeSpecs = /(?:navigation|feedback|storybook)\.spec\.mjs/;
// Tests tagged @new-tab open a tab with a Ctrl+click on wide screens. The
// default headless shell sometimes never hands Playwright that tab although
// its request is served, so on 1280 those tests run in their own projects on
// the full Chromium build in new headless mode (channel "chromium"), and the
// shell projects skip them. Everything else stays on the shell, where the
// clipboard and Back navigation specs behave as in the shipped apps; at 390
// the tests use touch and open no tab, so they stay on the shell.
const newTabTests = /@new-tab/;
const projects = [];
for (const width of [390, 1280]) {
  for (const theme of ["light", "dark"]) {
    for (const reducedMotion of ["no-preference", "reduce"]) {
      const testMatch =
        reducedMotion === "reduce"
          ? reducedMotionSpecs
          : theme === "dark"
            ? darkThemeSpecs
            : undefined;
      const use = {
        viewport: { width, height: 900 },
        hasTouch: width === 390,
        colorScheme: theme,
        reducedMotion,
      };
      projects.push({
        name: `${width}-${theme}-${reducedMotion}`,
        ...(testMatch ? { testMatch } : {}),
        ...(width === 1280 ? { grepInvert: newTabTests } : {}),
        use,
      });
      if (width === 1280)
        projects.push({
          name: `${width}-${theme}-${reducedMotion}-chromium`,
          ...(testMatch ? { testMatch } : {}),
          grep: newTabTests,
          use: { ...use, channel: "chromium" },
        });
    }
  }
}

export default defineConfig({
  testDir: "test/browser",
  testMatch: "**/*.spec.mjs",
  // Two workers, measured on the 4-vCPU GitHub runner. Run 40488203862: the
  // full suite passed 3 of 3 times at 2 workers (447-580 s), took 911 s at 1
  // worker, and failed 2 of 3 times at 4 workers, mostly on the Revoke
  // keyboard path, since fixed by reaching grid row actions by keyboard
  // (focusRowAction). Run 40500565361: 4 workers passed 2 of 3 times; the
  // failure was a Ctrl+click whose new tab never opened, which failed at 2
  // workers in the same run too. Raise this once those new-tab waits are
  // reliable at the higher count.
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
