import { execFileSync } from "node:child_process";
import { rm } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
// TypeScript 7 exports only package.json, not bin/tsc, so locate the
// compiler through the package's bin metadata.
const typescriptManifest = require.resolve("typescript/package.json");
const tsc = path.join(
  path.dirname(typescriptManifest),
  require(typescriptManifest).bin.tsc,
);
await rm("dist", { recursive: true, force: true });
execFileSync(process.execPath, [tsc, "-p", "tsconfig.build.json"], {
  stdio: "inherit",
});
await import("./copy-styles.mjs");
