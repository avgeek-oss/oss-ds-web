// Rebuilds the Avgeek OSS design-system artifact from this checkout.
// Output: artifacts/design-system/project/** (the system's files) and uploads/** (marks and icons).
// Usage: pnpm design-system [--check]
// Callbacks passed to page.evaluate run in the browser page, not in Node.
/* global document, getComputedStyle */
import { execFileSync } from "node:child_process";
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import tailwindcss from "@tailwindcss/vite";
import postcss from "postcss";
import { build } from "vite";
import * as definitions from "./tokens.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..");
const outRoot = path.join(repo, "artifacts", "design-system");
const project = path.join(outRoot, "project");
const work = path.join(outRoot, ".work");
const require = createRequire(path.join(repo, "package.json"));
const check = process.argv.includes("--check");

const namespace = "AvgeekOSS";
const groupOrder = [
  "Actions",
  "Forms",
  "Pickers",
  "Data display",
  "Typography",
  "Feedback",
  "Charts",
  "Navigation",
  "Overlays",
  "Layouts",
  "Assistant",
  "Auth",
  "Account settings",
  "Team settings",
  "Data patterns",
];
const icons = [
  "PanelLeftIcon",
  "Menu01Icon",
  "Notification02Icon",
  "MoreHorizontalIcon",
  "Sun03Icon",
  "Moon02Icon",
  "ViewIcon",
  "ViewOffSlashIcon",
  "FingerPrintIcon",
  "Login01Icon",
  "InformationCircleIcon",
  "SourceCodeIcon",
  "ArrowDown01Icon",
];
// Avatars look up Gravatar by email; offline previews fall back to initials by design.
const expectedConsoleErrors = [/Failed to load resource.*404/];

const log = (message) => process.stdout.write(`${message}\n`);
const write = async (file, content) => {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
};

await rm(outRoot, { recursive: true, force: true });
await mkdir(work, { recursive: true });

log("Building the package types");
execFileSync(process.execPath, [path.join(repo, "scripts", "build.mjs")], {
  cwd: repo,
  stdio: "inherit",
});

const react = path.join(here, "shims", "react.cjs");
const reactDom = path.join(here, "shims", "react-dom.cjs");
const shared = {
  configFile: false,
  logLevel: "warn",
  define: { "process.env.NODE_ENV": '"production"' },
};
async function iife(entry, outDir, alias, extra = {}, name = "_") {
  await build({
    ...shared,
    root: here,
    resolve: { alias },
    ...extra,
    build: {
      outDir,
      emptyOutDir: true,
      minify: true,
      cssCodeSplit: false,
      lib: {
        entry,
        name,
        formats: ["iife"],
        fileName: () => "index.js",
        cssFileName: "index",
      },
      rollupOptions: {
        // Bundling a whole client library into one script; per-module directives do not apply.
        onwarn(warning, warn) {
          if (warning.code !== "MODULE_LEVEL_DIRECTIVE") warn(warning);
        },
      },
      ...extra.build,
    },
  });
  return readFile(path.join(outDir, "index.js"), "utf8");
}
const reactAliases = [
  { find: /^react$/, replacement: react },
  { find: /^react-dom(\/client)?$/, replacement: reactDom },
];

log("Bundling the component library");
const bundleEntry = path.join(work, "bundle-entry.ts");
await write(
  bundleEntry,
  `import "${path.join(here, "styles.css")}";\nexport * from "${path.join(here, "namespace.ts")}";\n`,
);
// The IIFE's top-level var is window.AvgeekOSS when the page runs it as a classic script.
// Prism's markup grammar contains "<!--" in regex literals; "<\\!--" matches the same text.
const bundle = (
  await iife(
    bundleEntry,
    path.join(work, "bundle"),
    reactAliases,
    { plugins: [tailwindcss()] },
    namespace,
  )
).replaceAll("<!--", "<\\!--");
const compiledCss = await readFile(
  path.join(work, "bundle", "index.css"),
  "utf8",
);

log("Bundling React for the preview frame");
const reactLib = await iife(
  path.join(here, "shims", "react-global.mjs"),
  path.join(work, "react"),
  [],
);
const reactDomLib = await iife(
  path.join(here, "shims", "react-dom-global.mjs"),
  path.join(work, "react-dom"),
  [{ find: /^react$/, replacement: react }],
);

log("Resolving color tokens in both themes");
const browser = await chromium.launch();
const resolved = {};
for (const theme of definitions.colorThemes.map((item) => item.id)) {
  const page = await browser.newPage();
  await page.setContent(
    `<html class="${theme}" data-theme="${theme}"><head><style>${compiledCss}</style></head><body></body></html>`,
  );
  resolved[theme] = await page.evaluate(
    (names) =>
      Object.fromEntries(
        names.map((name) => {
          const probe = document.createElement("span");
          probe.style.color = `var(--${name})`;
          document.body.append(probe);
          const value = getComputedStyle(probe).color;
          probe.remove();
          return [name, value];
        }),
      ),
    definitions.colors.map((token) => token.name),
  );
  await page.close();
}
const round = (value) =>
  value
    .replace(/-?\d+\.\d+/g, (number) => String(Number(number).toFixed(4)))
    .replace(/(\.\d*?)0+(?=[\s)/,])/g, "$1")
    .replace(/\.(?=[\s)/,])/g, "");
function colorValue(css) {
  const rgba = /^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)$/.exec(css);
  if (!rgba) return round(css);
  const [, r, g, b, a] = rgba;
  const hex = (n) => Number(n).toString(16).padStart(2, "0");
  const alpha = a === undefined ? "" : hex(Math.round(Number(a) * 255));
  return `#${hex(r)}${hex(g)}${hex(b)}${alpha}`;
}
const colorTokens = definitions.colors.map(({ name, alias = {}, usage }) => ({
  name,
  value: Object.fromEntries(
    definitions.colorThemes.map(({ id }) => [
      id,
      alias[id] ? `{${alias[id]}}` : colorValue(resolved[id][name]),
    ]),
  ),
  usage,
}));

const git = (...args) =>
  execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim();
const tokenNames = new Set();
const tokens = {
  name: "Avgeek OSS",
  version: 1,
  meta: {
    source: "github",
    repo: "avgeek-oss/oss-ds-web",
    ref: `${git("rev-parse", "--abbrev-ref", "HEAD")}@${git("rev-parse", "--short", "HEAD")}`,
    package: ".",
    paths: {
      tokens: [
        "src/styles/globals.css",
        "@heroui/styles default theme",
        "design-system/tokens.mjs",
      ],
      fonts: ["@fontsource-variable/inter", "@fontsource-variable/geist-mono"],
      assets: ["studio/assets", "@hugeicons/core-free-icons"],
      docs: ["design-system/content"],
    },
    synced: new Date().toISOString().slice(0, 10),
  },
  color: { themes: definitions.colorThemes, tokens: colorTokens },
  type: definitions.typography,
  spacing: definitions.spacing,
  radius: definitions.radius,
  shadow: definitions.shadow,
  layout: definitions.layout,
  border: definitions.border,
  opacity: definitions.opacity,
};
for (const [family, value] of Object.entries(tokens)) {
  if (family === "type" || !value?.tokens) continue;
  for (const token of value.tokens) {
    if (tokenNames.has(token.name))
      throw new Error(`Duplicate token ${token.name}`);
    tokenNames.add(token.name);
  }
}
await write(
  path.join(project, "tokens.json"),
  `${JSON.stringify(tokens, null, 1)}\n`,
);

// tokens.json is the one source for these values: remove the bundle's own theme declarations
// so a token edited on the design-system page reaches the previews. The page declares the fonts.
const themeSelector =
  /^(:root|:host|\.light|\.dark|\.default|\[data-theme="?(light|dark|default)"?\]|:host\(.*\))$/;
const stylesheet = postcss.parse(compiledCss);
stylesheet.walkAtRules("font-face", (rule) => rule.remove());
stylesheet.walkRules((rule) => {
  if (!rule.selectors.every((selector) => themeSelector.test(selector.trim())))
    return;
  rule.each((node) => {
    if (node.type === "decl" && tokenNames.has(node.prop.slice(2)))
      node.remove();
  });
  if (rule.nodes.length === 0) rule.remove();
});
const bundleCss = stylesheet.toString();

log("Compiling component previews");
const previewsDir = path.join(here, "previews");
const cards = [];
for (const file of (await readdir(previewsDir)).sort()) {
  if (!file.endsWith(".tsx") || file === "mount.tsx") continue;
  const name = file.replace(/\.tsx$/, "");
  const source = await readFile(path.join(previewsDir, file), "utf8");
  const marker = /^\/\/ (@dsCard[^\n]*)\n/.exec(source);
  if (!marker) throw new Error(`${file} must start with a // @dsCard marker`);
  const group = /group="([^"]+)"/.exec(marker[1])?.[1] ?? "";
  if (!groupOrder.includes(group))
    throw new Error(`${file}: unknown group ${group}`);
  const script = await iife(
    path.join(previewsDir, file),
    path.join(work, "previews", name),
    [
      {
        find: /^\.\.\/namespace\.js$/,
        replacement: path.join(here, "shims", "namespace.cjs"),
      },
      ...reactAliases,
    ],
  );
  await write(
    path.join(project, "components", name, "preview.html"),
    `<!-- ${marker[1]} -->\n<!doctype html>\n<html>\n<head><meta charset="utf-8"><title>${name} — preview</title></head>\n<body>\n<div id="root"></div>\n<script>\n${script}</script>\n</body>\n</html>\n`,
  );
  cards.push({ name, group });
}
cards.sort(
  (a, b) =>
    groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group) ||
    a.name.localeCompare(b.name),
);

log("Writing the bundle, types and libraries");
const header = {
  format: 4,
  namespace,
  components: cards.map(({ name }) => ({ name })),
};
await write(
  path.join(project, "components", "bundle.js"),
  `/* @ds-bundle: ${JSON.stringify(header)} */\n${bundle}`,
);
await write(path.join(project, "components", "bundle.css"), bundleCss);
await write(
  path.join(project, "components", "lib", "react.production.min.js"),
  reactLib,
);
await write(
  path.join(project, "components", "lib", "react-dom.production.min.js"),
  reactDomLib,
);

const dist = path.join(repo, "dist");
const declarations = [];
async function collect(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!["adapters", "emails"].includes(entry.name)) await collect(file);
    } else if (
      entry.name.endsWith(".d.ts") &&
      file !== path.join(dist, "index.d.ts")
    ) {
      declarations.push({ file, text: await readFile(file, "utf8") });
    }
  }
}
await collect(dist);
const typesByFile = new Map();
for (const { name } of cards) {
  const exported = new RegExp(
    `export (declare )?(const|function|class) ${name}\\b|export \\{[^}]*\\b${name}\\b[^}]*\\}`,
  );
  const match = declarations
    .filter(({ text }) => exported.test(text))
    .sort((a, b) => a.file.length - b.file.length)[0];
  if (!match) throw new Error(`No declaration exports ${name}`);
  typesByFile.set(match, [...(typesByFile.get(match) ?? []), name]);
}
const typeBlocks = [...typesByFile].map(([{ file, text }, names]) => {
  const source = path.relative(dist, file).replace(/\.d\.ts$/, "");
  return `// ── ${names.join(", ")} · src/${source}\n${text.replace(/\n\/\/# sourceMappingURL=.*/, "").trim()}\n`;
});
await write(
  path.join(project, "components", "index.d.ts"),
  `// Avgeek OSS Design System — public component types from the package build (@avgeek-oss/design-system).\n// Documentation only: each block is one source module; imports refer to the package dependencies.\n\n${typeBlocks.join("\n")}`,
);

log("Copying content and fonts");
async function copyTree(from, to) {
  for (const entry of await readdir(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) await copyTree(source, target);
    else {
      await mkdir(path.dirname(target), { recursive: true });
      await copyFile(source, target);
    }
  }
}
await copyTree(path.join(here, "content"), project);
for (const { name } of cards) {
  await readFile(path.join(project, "components", name, "README.md"));
}
await mkdir(path.join(project, "fonts"), { recursive: true });
for (const font of definitions.typography.fonts) {
  const pkg = font.family.startsWith("Inter")
    ? "@fontsource-variable/inter"
    : "@fontsource-variable/geist-mono";
  const file = path.basename(font.file);
  await copyFile(
    path.join(
      path.dirname(require.resolve(`${pkg}/package.json`)),
      "files",
      file,
    ),
    path.join(project, "fonts", file),
  );
}

log("Writing marks and icons for upload");
for (const file of ["avgeek-dev-light.svg", "avgeek-dev-dark.svg"]) {
  await mkdir(path.join(outRoot, "uploads", "Logos"), { recursive: true });
  await copyFile(
    path.join(repo, "studio", "assets", file),
    path.join(outRoot, "uploads", "Logos", file),
  );
}
const iconSet = await import("@hugeicons/core-free-icons");
const attribute = (key) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
for (const icon of icons) {
  const elements = iconSet[icon]
    .map(([tag, attributes]) => {
      const pairs = Object.entries(attributes)
        .filter(([key]) => key !== "key")
        .map(([key, value]) => {
          // An <img> cannot inherit currentColor; preview files use the eclipse ink.
          const ink = value === "currentColor" ? "#18181b" : value;
          return `${attribute(key)}="${ink}"`;
        });
      return `<${tag} ${pairs.join(" ")}/>`;
    })
    .join("");
  const file = icon
    .replace(/Icon$/, "")
    .replace(/([a-z])([A-Z0-9])/g, "$1-$2")
    .replace(/(\d)([A-Z])/g, "$1-$2")
    .toLowerCase();
  await write(
    path.join(outRoot, "uploads", "Icons", `${file}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">${elements}</svg>\n`,
  );
}

for (const [file, text] of [
  ["components/bundle.js", bundle],
  ["components/lib/react.production.min.js", reactLib],
  ["components/lib/react-dom.production.min.js", reactDomLib],
]) {
  // Consumers inline these scripts; either sequence would end or escape the element.
  if (/<\/script|<!--/i.test(text))
    throw new Error(`${file} contains </script or <!--`);
}
for (const { name } of cards) {
  const html = await readFile(
    path.join(project, "components", name, "preview.html"),
    "utf8",
  );
  if (
    /<\/script/i.test(
      html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>")),
    )
  )
    throw new Error(`${name} preview script contains </script`);
}

const published = [];
async function list(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await list(file);
    else published.push(path.relative(outRoot, file));
  }
}
await list(project);
await write(
  path.join(outRoot, "publish.json"),
  `${JSON.stringify(
    {
      index: {
        namespace,
        libraries: [
          {
            name: "react",
            version: require("react/package.json").version,
            global: "React",
            file: "components/lib/react.production.min.js",
          },
          {
            name: "react-dom",
            version: require("react-dom/package.json").version,
            global: "ReactDOM",
            file: "components/lib/react-dom.production.min.js",
          },
        ],
      },
      files: published.sort(),
      uploads: { Logos: "uploads/Logos", Icons: "uploads/Icons" },
    },
    null,
    2,
  )}\n`,
);

if (check) {
  log(`Rendering ${cards.length} previews in light and dark`);
  const fontFaces = (
    await Promise.all(
      definitions.typography.fonts.map(async (font) => {
        const data = (await readFile(path.join(project, font.file))).toString(
          "base64",
        );
        return `@font-face{font-family:"${font.family}";src:url(data:font/woff2;base64,${data});font-weight:${font.weight};font-style:${font.style}}`;
      }),
    )
  ).join("");
  const failures = [];
  for (const theme of definitions.colorThemes.map((item) => item.id)) {
    // Mirror the page's tokens.css so previews render with the system's values.
    const declarations = [];
    for (const family of ["color", "shadow"]) {
      for (const token of tokens[family].tokens) {
        const value =
          typeof token.value === "string" ? token.value : token.value[theme];
        declarations.push(
          `--${token.name}:${value.replace(/^\{(.+)\}$/, "var(--$1)")}`,
        );
      }
    }
    for (const family of ["spacing", "radius", "layout", "border", "opacity"]) {
      for (const token of tokens[family].tokens)
        declarations.push(`--${token.name.replace(".", "\\.")}:${token.value}`);
    }
    const tokensCss = `:root{${declarations.join(";")}}${fontFaces}`;
    for (const { name } of cards) {
      const html = await readFile(
        path.join(project, "components", name, "preview.html"),
        "utf8",
      );
      const width = Number(/width=(\d+)/.exec(html)?.[1] ?? 720);
      const height = Number(/height=(\d+)/.exec(html)?.[1] ?? 120);
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() !== "error") return;
        if (
          expectedConsoleErrors.some((pattern) => pattern.test(message.text()))
        )
          return;
        errors.push(message.text());
      });
      const scripts = [reactLib, reactDomLib, bundle]
        .map((text) => `<script>${text}</script>`)
        .join("");
      await page.setContent(
        html
          .replace("<html>", `<html data-theme="${theme}">`)
          // A replacer function: the inlined scripts contain "$" sequences String.replace would expand.
          .replace(
            "<head>",
            () =>
              `<head><style>${tokensCss}</style><style>${bundleCss}</style>${scripts}`,
          ),
      );
      await page.waitForTimeout(400);
      const rendered = await page.evaluate(
        () =>
          (document.getElementById("root")?.childElementCount ?? 0) > 0 ||
          document.body.childElementCount > 2,
      );
      if (!rendered) errors.push("rendered nothing");
      if (errors.length)
        failures.push(`${name} [${theme}]: ${errors.join("; ")}`);
      await page.close();
    }
  }
  if (failures.length) {
    await browser.close();
    throw new Error(`Preview check failed:\n${failures.join("\n")}`);
  }
}
await browser.close();
await rm(work, { recursive: true, force: true });
log(
  `Wrote ${cards.length} cards and ${published.length} files to ${path.relative(repo, outRoot)}.`,
);
