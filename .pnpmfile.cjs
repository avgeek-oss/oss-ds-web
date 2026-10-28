// TypeScript 7 has no programmatic compiler API. Storybook's docs read
// component props through it: react-docgen-typescript and the
// @joshwooding/vite-plugin-react-docgen-typescript plugin that runs it
// declare typescript as a peer, which would resolve to the workspace's
// TypeScript 7. Neither overrides nor packageExtensions can replace a peer,
// so this hook turns that peer into a dependency on @typescript/typescript6:
// the TypeScript 6 API, published by the TypeScript team for tools that
// still need it. tsc stays TypeScript 7, and linting (oxlint) needs no API.
const TYPESCRIPT_6 = "npm:@typescript/typescript6@6.0.2";

function needsTypeScriptApi(name) {
  return (
    name === "react-docgen-typescript" ||
    name === "@joshwooding/vite-plugin-react-docgen-typescript"
  );
}

function readPackage(pkg) {
  // pnpm dlx's temporary project has no name.
  const name = pkg.name ?? "";
  if (needsTypeScriptApi(name) && pkg.peerDependencies?.typescript) {
    delete pkg.peerDependencies.typescript;
    if (pkg.peerDependenciesMeta) delete pkg.peerDependenciesMeta.typescript;
    pkg.dependencies = { ...pkg.dependencies, typescript: TYPESCRIPT_6 };
  }
  return pkg;
}

module.exports = { hooks: { readPackage } };
