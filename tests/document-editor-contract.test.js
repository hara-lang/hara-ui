import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("document editor exposes kernel evaluation and Hestia batch boundaries", async () => {
  const source = await read("document-editor.js");
  assert.match(source, /evaluateArtefact/);
  assert.match(source, /hara-document-batch/);
  assert.match(source, /createOperationBatch/);
  assert.match(source, /createArtefactCommitOperation/);
  assert.match(source, /Commit snapshot/);
});

test("embedded HTML artefacts are projected through a sandbox", async () => {
  const source = await read("document-editor.js");
  assert.match(source, /<iframe class="hara-artefact-frame" sandbox=""/);
  assert.match(source, /Content-Security-Policy/);
  assert.doesNotMatch(source, /innerHTML\s*=\s*result\.html/);
});

test("artefact source is a normal text node rather than opaque HTML", async () => {
  const model = await read("document-model.js");
  assert.match(model, /children: \[createTextNode\(source, sourceId\)\]/);
  assert.match(model, /type: "text\.splice"/);
  assert.match(model, /sourceRoot/);
  assert.match(model, /resultRoot/);
});

test("the demo contains directly embedded value and table artefacts", async () => {
  const demo = await read("document-demo.html");
  assert.match(demo, /kind: "value"/);
  assert.match(demo, /kind: "table"/);
  assert.match(demo, /onBatch\(batch\)/);
  assert.match(demo, /localStorage\.setItem/);
});
