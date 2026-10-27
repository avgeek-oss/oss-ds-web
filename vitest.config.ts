import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  optimizeDeps: { include: ["@heroui/react/rac", "storybook/theming"] },
  define: { "process.env.NODE_ENV": JSON.stringify("test") },
  plugins: [
    tailwindcss(),
    storybookTest({ configDir: resolve(import.meta.dirname, ".storybook") }),
  ],
  test: {
    name: "stories",
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: "chromium" }],
    },
    testTimeout: 30000,
    maxWorkers: 4,
  },
});
