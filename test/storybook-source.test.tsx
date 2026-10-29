import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import ts from "@typescript/typescript6";
import { createExampleSourceTransform } from "../.storybook/example-source";

test("catalogue source includes real composition and sample callbacks, rather than a private preview import", () => {
  const transform = createExampleSourceTransform();
  // The Button example's package import and Example export are checked in
  // the built docs by test/browser/storybook.spec.mjs; these two stories
  // cover sample callbacks and local preview components.
  for (const file of [
    "stories/Patterns/Team Settings/TeamGeneralSettings.stories.tsx",
    "stories/Patterns/Auth/StepUpDialog.stories.tsx",
  ]) {
    const id = path.resolve(file);
    const transformed = transform(readFileSync(id, "utf8"), id);
    assert.ok(transformed);
    const ast = ts.createSourceFile(
      id,
      transformed.code,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const examples: string[] = [];
    function visit(node: ts.Node) {
      if (
        ts.isPropertyAssignment(node) &&
        node.name.getText(ast) === "code" &&
        ts.isStringLiteral(node.initializer)
      )
        examples.push(node.initializer.text);
      ts.forEachChild(node, visit);
    }
    visit(ast);
    assert.ok(examples.length > 0);
    for (const example of examples) {
      assert.match(example, /@avgeek-oss\/design-system\//);
      assert.match(example, /export const Example/);
      assert.doesNotMatch(example, /from ["'].*studio\//);
      assert.doesNotMatch(example, /from ["'].*src\//);
      const compiled = ts.transpileModule(example, {
        reportDiagnostics: true,
        compilerOptions: {
          jsx: ts.JsxEmit.ReactJSX,
          module: ts.ModuleKind.ESNext,
        },
      });
      assert.deepEqual(compiled.diagnostics, []);
    }
    const first = examples[0];
    assert.ok(first);
    if (file.includes("TeamGeneralSettings"))
      assert.match(first, /setValue\(name\)/);
    if (file.includes("StepUpDialog"))
      assert.match(first, /function StepUpPreview/);
  }
});
