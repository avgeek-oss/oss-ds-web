import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { setTimeout } from "node:timers/promises";
import { createHash } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { validateCandidate } from "./release-validation.mjs";

const repository = process.cwd();
const manifest = JSON.parse(await readFile("package.json", "utf8"));
const published = process.argv.includes("--published");
const temporary = await mkdtemp(
  path.join(tmpdir(), "oss-design-system-package-"),
);
const artifacts = path.join(repository, "artifacts");
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const run = (command, args, cwd = repository) =>
  execFileSync(command, args, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
// Like run, but keeps stderr so the caller can decide whether to retry.
const runCapturingErrors = (command, args) =>
  execFileSync(command, args, {
    cwd: repository,
    stdio: ["inherit", "inherit", "pipe"],
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
const isVersionNotYetVisible = (error) => {
  const stderr = String(error?.stderr ?? "");
  process.stderr.write(stderr);
  return /\b(ETARGET|E404)\b/.test(stderr);
};
const writeJson = (file, value) =>
  writeFile(file, `${JSON.stringify(value, null, 2)}\n`);

try {
  await mkdir(artifacts, { recursive: true });
  if (published) {
    // The registry can take a minute to serve a version right after it is
    // published, so a "no matching version" answer is retried for a while.
    const packArguments = [
      "pack",
      `${manifest.name}@${manifest.version}`,
      "--registry=https://registry.npmjs.org",
      "--ignore-scripts",
      "--pack-destination",
      temporary,
    ];
    for (let attempt = 1; ; attempt += 1) {
      try {
        runCapturingErrors("npm", packArguments);
        break;
      } catch (error) {
        if (attempt === 12 || !isVersionNotYetVisible(error)) throw error;
        console.log(
          `${manifest.name}@${manifest.version} is not visible on the registry yet (attempt ${attempt}); retrying in 10s`,
        );
        await setTimeout(10_000);
      }
    }
  } else {
    run(pnpm, ["pack", "--pack-destination", temporary]);
  }
  const tarball = (await readdir(temporary)).find((file) =>
    file.endsWith(".tgz"),
  );
  assert.ok(tarball, "pnpm pack must produce a tarball");
  const candidate = path.join(temporary, tarball);
  if (published) {
    const report = JSON.parse(
      await readFile(path.join(artifacts, "package-report.json"), "utf8"),
    );
    validateCandidate(manifest, report, await readFile(candidate));
    // The bytes the registry serves are the verified candidate's bytes, and
    // the registry declares the same integrity. The candidate already passed
    // the export, content, type and Vite and Next.js consumer checks in the
    // verify run, so building consumers again from identical bytes would
    // check nothing new.
    const declared = execFileSync(
      "npm",
      [
        "view",
        `${manifest.name}@${manifest.version}`,
        "dist.integrity",
        "--registry=https://registry.npmjs.org",
      ],
      { encoding: "utf8" },
    ).trim();
    assert.equal(
      declared,
      report.integrity,
      "The registry must declare the verified integrity",
    );
    process.stdout.write(
      `Verified ${manifest.name}@${manifest.version} on the registry: its tarball is byte-identical to the verified candidate (${report.integrity}).\n`,
    );
  } else {
    run("tar", ["-xzf", candidate, "-C", temporary]);
    const packed = path.join(temporary, "package");
    const packedManifest = JSON.parse(
      await readFile(path.join(packed, "package.json"), "utf8"),
    );
    assert.equal(packedManifest.name, manifest.name);
    assert.equal(packedManifest.version, manifest.version);

    for (const target of Object.values(packedManifest.exports)) {
      for (const file of typeof target === "string"
        ? [target]
        : Object.values(target)) {
        await readFile(path.join(packed, file));
      }
    }
    async function checkDeclarations(directory) {
      for (const file of await readdir(directory, { withFileTypes: true })) {
        const location = path.join(directory, file.name);
        if (file.isDirectory()) await checkDeclarations(location);
        else if (file.name.endsWith(".d.ts.map")) {
          const map = JSON.parse(await readFile(location, "utf8"));
          for (const source of map.sources)
            await readFile(path.resolve(directory, source));
        }
      }
    }
    await checkDeclarations(path.join(packed, "dist"));
    for (const file of [
      "LICENSE",
      "NOTICE",
      "README.md",
      "AGENTS.md",
      "CHANGELOG.md",
    ]) {
      await readFile(path.join(packed, file));
    }
    for (const forbidden of [
      "studio",
      "stories",
      ".storybook",
      "test",
      "scripts",
      "node_modules",
      ".env",
    ]) {
      assert.ok(
        !(await readdir(packed)).includes(forbidden),
        `${forbidden} must not be published`,
      );
    }

    const consumer = path.join(temporary, "consumer");
    await mkdir(consumer);
    const developmentPackages = [
      "typescript",
      "vite",
      "@vitejs/plugin-react",
      "@tailwindcss/vite",
      "@types/react",
      "@types/react-dom",
      "@types/node",
    ];
    await writeJson(path.join(consumer, "package.json"), {
      name: "design-system-package-consumer",
      private: true,
      type: "module",
      dependencies: {
        [manifest.name]: `file:${candidate}`,
        react: manifest.devDependencies.react,
        "react-dom": manifest.devDependencies["react-dom"],
      },
      devDependencies: Object.fromEntries(
        developmentPackages.map((name) => [
          name,
          manifest.devDependencies[name],
        ]),
      ),
    });
    await writeJson(path.join(consumer, "tsconfig.json"), {
      compilerOptions: {
        target: "ES2022",
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        module: "ESNext",
        moduleResolution: "Bundler",
        jsx: "react-jsx",
        strict: true,
        skipLibCheck: true,
        noEmit: true,
      },
      include: ["main.tsx"],
    });
    const entryPoints = Object.keys(packedManifest.exports).filter(
      (entry) =>
        !entry.endsWith(".css") &&
        entry !== "./adapters/next" &&
        entry !== "./emails/render",
    );
    const imports = entryPoints.map(
      (entry, index) =>
        `import * as entry${index} from ${JSON.stringify(entry === "." ? manifest.name : `${manifest.name}/${entry.slice(2)}`)};`,
    );
    await writeFile(
      path.join(consumer, "main.tsx"),
      `${imports.join("\n")}
import { createRoot } from "react-dom/client";
import { Providers, SignIn } from "${manifest.name}";
import "${manifest.name}/styles.css";
const entryPoints = [${entryPoints.map((_, index) => `entry${index}`).join(", ")}];
if (entryPoints.some((entry) => entry == null)) throw new Error("Missing public entry point");
createRoot(document.getElementById("root")!).render(
  <Providers><SignIn brand="Avgeek" onSubmit={async () => {}} onForgotPassword={() => {}} /></Providers>
);
`,
    );
    await writeFile(
      path.join(consumer, "vite.config.mjs"),
      `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({plugins: [react(), tailwindcss()]});
`,
    );
    await writeFile(
      path.join(consumer, "index.html"),
      '<!doctype html><html><head><title>Package consumer</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
    );
    run(
      pnpm,
      ["install", "--ignore-scripts", "--config.auto-install-peers=false"],
      consumer,
    );
    await writeFile(
      path.join(consumer, "email-consumer.mjs"),
      `import assert from "node:assert/strict";
import { renderAuthEmail } from "${manifest.name}/emails/render";
const email = await renderAuthEmail("password-reset", {brand: {name: "Consumer", accentColor: "#0866bd"}, actionUrl: "https://example.test/reset#token"});
assert.match(email.html, /Reset password/);
assert.ok(email.text.includes("https://example.test/reset#token"));
assert.equal(typeof globalThis.document, "undefined");
`,
    );
    run(process.execPath, ["email-consumer.mjs"], consumer);
    const consumerModules = await readdir(path.join(consumer, "node_modules"));
    assert.ok(
      !consumerModules.includes("next"),
      "The shared runtime must build without Next.js",
    );
    run(pnpm, ["exec", "tsc"], consumer);
    run(pnpm, ["exec", "vite", "build"], consumer);
    const assetFiles = await readdir(path.join(consumer, "dist/assets"));
    const styles = (
      await Promise.all(
        assetFiles
          .filter((file) => file.endsWith(".css"))
          .map((file) =>
            readFile(path.join(consumer, "dist/assets", file), "utf8"),
          ),
      )
    ).join("\n");
    assert.ok(
      styles.includes(".content-grid"),
      "Tailwind must scan the packed library classes",
    );
    assert.ok(
      styles.includes("identity-auth-form-panel"),
      "Auth styles must ship through the public stylesheet",
    );
    assert.ok(
      assetFiles.some((file) => file.endsWith(".woff2")),
      "Font assets must resolve in the consumer",
    );

    run(
      pnpm,
      [
        "add",
        `next@${manifest.devDependencies.next}`,
        `@tailwindcss/postcss@${manifest.dependencies.tailwindcss}`,
        "--ignore-scripts",
      ],
      consumer,
    );
    await mkdir(path.join(consumer, "app"));
    await writeFile(
      path.join(consumer, "app/layout.tsx"),
      `import type { ReactNode } from "react";
import "${manifest.name}/styles.css";
export const metadata = {title: "Design system consumer"};
export default function Layout({children}: {children: ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
`,
    );
    await writeFile(
      path.join(consumer, "app/page.tsx"),
      `"use client";
import { Providers, SignIn } from "${manifest.name}";
import { NextNavigationProvider } from "${manifest.name}/adapters/next";
export default function Page() {
  return <Providers><NextNavigationProvider>
    <SignIn brand="Avgeek" onSubmit={async () => {}} onForgotPassword={() => {}} />
  </NextNavigationProvider></Providers>;
}
`,
    );
    await writeFile(
      path.join(consumer, "postcss.config.mjs"),
      'export default {plugins: {"@tailwindcss/postcss": {}}};\n',
    );
    await writeJson(path.join(consumer, "tsconfig.json"), {
      compilerOptions: {
        target: "ES2022",
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        module: "ESNext",
        moduleResolution: "Bundler",
        jsx: "react-jsx",
        strict: true,
        skipLibCheck: true,
        noEmit: true,
        allowJs: true,
        incremental: true,
        esModuleInterop: true,
        resolveJsonModule: true,
        isolatedModules: true,
        plugins: [{ name: "next" }],
      },
      include: [
        "next-env.d.ts",
        "app/**/*.tsx",
        ".next/types/**/*.ts",
        ".next/dev/types/**/*.ts",
      ],
      exclude: ["node_modules"],
    });
    await writeFile(
      path.join(consumer, "next-env.d.ts"),
      '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n',
    );
    run(pnpm, ["exec", "next", "build"], consumer);

    const archive = await readFile(candidate);
    await writeFile(path.join(artifacts, tarball), archive);
    await writeJson(path.join(artifacts, "package-report.json"), {
      name: manifest.name,
      version: manifest.version,
      tarball,
      bytes: archive.length,
      integrity: `sha512-${createHash("sha512").update(archive).digest("base64")}`,
      publicEntryPoints: Object.keys(packedManifest.exports).length,
      consumerEntryPoints: entryPoints.length,
      checks: [
        "export targets",
        "package contents",
        "isolated install",
        "public types",
        "declaration map sources",
        "Vite build without Next.js",
        "Next.js adapter production build",
        "Tailwind source scanning",
        "auth styles",
        "font assets",
      ],
    });
    process.stdout.write(
      `Verified ${manifest.name}@${manifest.version}: ${entryPoints.length} consumer entry points. Candidate saved in artifacts/${tarball}.\n`,
    );
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
