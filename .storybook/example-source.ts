import path from "node:path";
import ts from "@typescript/typescript6";
import type { Plugin } from "vite";

/** Show the composition behind a preview, including its local sample callbacks. */
export function createExampleSourceTransform() {
  const root = process.cwd();
  const files = ts.sys.readDirectory(path.join(root, "stories"), [".tsx"]);
  const options: ts.CompilerOptions = {
    jsx: ts.JsxEmit.ReactJSX,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ESNext,
    skipLibCheck: true,
  };
  let program = ts.createProgram(files, options);
  let checker = program.getTypeChecker();
  const printer = ts.createPrinter();
  const localExample = (file: string) =>
    file.startsWith(path.join(root, "stories") + path.sep) ||
    file.startsWith(path.join(root, "studio") + path.sep);

  function sourceFor(render: ts.Node, storyFile: ts.SourceFile) {
    let owner: ts.Node = render;
    while (owner.parent && !ts.isSourceFile(owner.parent)) owner = owner.parent;
    const declarations = new Set<ts.Statement>();
    const imports = new Map<string, Set<string>>();
    const aliases = new Set<string>();
    function visit(node: ts.Node) {
      if (ts.isIdentifier(node)) {
        const symbol = checker.getSymbolAtLocation(node);
        for (const declaration of symbol?.declarations ?? []) {
          if (
            ts.isImportSpecifier(declaration) ||
            ts.isImportClause(declaration)
          ) {
            const importDeclaration = ts.isImportSpecifier(declaration)
              ? declaration.parent.parent.parent
              : declaration.parent;
            if (!ts.isImportDeclaration(importDeclaration)) continue;
            const module = importDeclaration.moduleSpecifier;
            if (!ts.isStringLiteral(module)) continue;
            if (!symbol) continue;
            const imported = checker.getAliasedSymbol(symbol);
            const definition = imported.declarations?.[0];
            if (
              definition &&
              localExample(definition.getSourceFile().fileName)
            ) {
              collect(definition);
              const original = ts.isImportSpecifier(declaration)
                ? (declaration.propertyName?.text ?? declaration.name.text)
                : ts.isFunctionDeclaration(definition) && definition.name
                  ? definition.name.text
                  : imported.getName();
              const local = declaration.name?.text;
              if (local && original !== local)
                aliases.add(`const ${local} = ${original};`);
            } else {
              const absolute = path.resolve(
                path.dirname(declaration.getSourceFile().fileName),
                module.text,
              );
              const specifier =
                module.text.startsWith(".") &&
                absolute.startsWith(path.join(root, "src") + path.sep)
                  ? `@avgeek-oss/design-system/${path.relative(path.join(root, "src"), absolute).replaceAll(path.sep, "/")}`
                  : module.text;
              const names = imports.get(specifier) ?? new Set<string>();
              if (ts.isImportSpecifier(declaration))
                names.add(
                  `${declaration.isTypeOnly || declaration.parent.parent.isTypeOnly ? "type " : ""}${declaration.propertyName ? `${declaration.propertyName.text} as ` : ""}${declaration.name.text}`,
                );
              imports.set(specifier, names);
            }
          } else if (localExample(declaration.getSourceFile().fileName)) {
            collect(declaration);
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    function collect(node: ts.Node) {
      let statement = node;
      while (statement.parent && !ts.isSourceFile(statement.parent))
        statement = statement.parent;
      if (
        !ts.isStatement(statement) ||
        declarations.has(statement) ||
        statement === render
      )
        return;
      // Parameters and local bindings are already included in their containing function.
      if (ts.isImportDeclaration(statement) || statement === owner) return;
      declarations.add(statement);
      visit(statement);
    }
    visit(render);
    const code = [
      ...Array.from(
        imports,
        ([module, names]) =>
          `import { ${[...names].join(", ")} } from ${JSON.stringify(module)};`,
      ),
      ...Array.from(declarations, (node) =>
        printer
          .printNode(ts.EmitHint.Unspecified, node, node.getSourceFile())
          .replace(/^export (default )?/, ""),
      ),
      ...aliases,
      `export const Example = ${printer.printNode(ts.EmitHint.Unspecified, render, storyFile)};`,
    ].join("\n\n");
    return code;
  }

  return (code: string, id: string) => {
    if (!id.endsWith(".stories.tsx")) return;
    if (program.getSourceFile(id)?.text !== code) {
      program = ts.createProgram(files, options);
      checker = program.getTypeChecker();
    }
    const file = program.getSourceFile(id);
    if (!file) return;
    const edits: { start: number; text: string }[] = [];
    for (const statement of file.statements) {
      if (
        !ts.isVariableStatement(statement) ||
        !statement.modifiers?.some(
          (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
        )
      )
        continue;
      for (const declaration of statement.declarationList.declarations) {
        if (
          !declaration.initializer ||
          !ts.isObjectLiteralExpression(declaration.initializer)
        )
          continue;
        const render = declaration.initializer.properties.find(
          (property) =>
            ts.isPropertyAssignment(property) &&
            property.name.getText(file) === "render",
        );
        if (!render || !ts.isPropertyAssignment(render)) continue;
        edits.push({
          start: declaration.initializer.getStart(file) + 1,
          text: `parameters: { docs: { source: { code: ${JSON.stringify(sourceFor(render.initializer, file))}, language: "tsx", type: "code" } } },`,
        });
      }
    }
    for (const edit of edits.reverse())
      code = code.slice(0, edit.start) + edit.text + code.slice(edit.start);
    return { code, map: null };
  };
}

export function exampleSource(): Plugin {
  return {
    name: "catalogue-example-source",
    enforce: "pre",
    transform: createExampleSourceTransform(),
  };
}
